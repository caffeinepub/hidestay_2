import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Customer = {
    name : Text;
    email : Text;
    phone : Text;
    password : Text;
    active : Bool;
  };

  type HotelOwner = {
    name : Text;
    email : Text;
    phone : Text;
    password : Text;
    active : Bool;
  };

  type Property = {
    id : Text;
    propertyName : Text;
    propertyType : Text;
    city : Text;
    address : Text;
    contactPhone : Text;
    description : Text;
    imageUrls : [Text];
    pricePerNight : Nat;
    amenities : [Text];
    rules : Text;
    checkinTime : Text;
    checkoutTime : Text;
    ownerEmail : Text;
    status : Text;
  };

  type Booking = {
    id : Text;
    propertyId : Text;
    stayName : Text;
    location : Text;
    checkin : Text;
    checkout : Text;
    guestName : Text;
    phone : Text;
    email : Text;
    guests : Nat;
    status : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    userType : Text; // "customer" or "owner"
  };

  let customers = Map.empty<Text, Customer>();
  let hotelOwners = Map.empty<Text, HotelOwner>();
  let properties = Map.empty<Text, Property>();
  let bookings = Map.empty<Text, Booking>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile operations (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Customer operations
  public shared ({ caller }) func registerCustomer(name : Text, email : Text, phone : Text, password : Text) : async Customer {
    if (customers.containsKey(email)) {
      Runtime.trap("Email already registered");
    };
    let customer : Customer = {
      name;
      email;
      phone;
      password;
      active = true;
    };
    customers.add(email, customer);
    customer;
  };

  public shared ({ caller }) func loginCustomer(email : Text, password : Text) : async Customer {
    switch (customers.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?customer) {
        if (customer.password != password) {
          Runtime.trap("Incorrect password");
        } else if (not customer.active) {
          Runtime.trap("Account is disabled");
        };
        customer;
      };
    };
  };

  public query ({ caller }) func getCustomerByEmail(email : Text) : async Customer {
    // Customer can view their own profile, or admin can view any
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.email != email and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own customer profile");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own customer profile");
        };
      };
    };

    switch (customers.get(email)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?customer) { customer };
    };
  };

  public shared ({ caller }) func updateCustomerPassword(email : Text, newPassword : Text) : async () {
    // Customer can update their own password, or admin can update any
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.email != email and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own password");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own password");
        };
      };
    };

    switch (customers.get(email)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?customer) {
        let updatedCustomer : Customer = { customer with password = newPassword };
        customers.add(email, updatedCustomer);
      };
    };
  };

  public shared ({ caller }) func disableCustomer(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can disable customers");
    };

    switch (customers.get(email)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?customer) {
        let updatedCustomer : Customer = { customer with active = false };
        customers.add(email, updatedCustomer);
      };
    };
  };

  public shared ({ caller }) func enableCustomer(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can enable customers");
    };

    switch (customers.get(email)) {
      case (null) { Runtime.trap("Customer does not exist") };
      case (?customer) {
        let updatedCustomer : Customer = { customer with active = true };
        customers.add(email, updatedCustomer);
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete customers");
    };

    if (not customers.containsKey(email)) {
      Runtime.trap("Customer does not exist");
    };
    customers.remove(email);
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };
    customers.values().toArray();
  };

  // Hotel Owner operations
  public shared ({ caller }) func registerOwner(name : Text, email : Text, phone : Text, password : Text) : async HotelOwner {
    if (hotelOwners.containsKey(email)) {
      Runtime.trap("Email already registered");
    };
    let owner : HotelOwner = {
      name;
      email;
      phone;
      password;
      active = true;
    };
    hotelOwners.add(email, owner);
    owner;
  };

  public shared ({ caller }) func loginOwner(email : Text, password : Text) : async HotelOwner {
    switch (hotelOwners.get(email)) {
      case (null) { Runtime.trap("Email not found") };
      case (?owner) {
        if (owner.password != password) {
          Runtime.trap("Incorrect password");
        } else if (not owner.active) {
          Runtime.trap("Account is disabled");
        };
        owner;
      };
    };
  };

  public query ({ caller }) func getAllOwners() : async [HotelOwner] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all owners");
    };
    hotelOwners.values().toArray();
  };

  public shared ({ caller }) func disableOwner(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can disable owners");
    };

    switch (hotelOwners.get(email)) {
      case (null) { Runtime.trap("Owner does not exist") };
      case (?owner) {
        let updatedOwner : HotelOwner = { owner with active = false };
        hotelOwners.add(email, updatedOwner);
      };
    };
  };

  public shared ({ caller }) func enableOwner(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can enable owners");
    };

    switch (hotelOwners.get(email)) {
      case (null) { Runtime.trap("Owner does not exist") };
      case (?owner) {
        let updatedOwner : HotelOwner = { owner with active = true };
        hotelOwners.add(email, updatedOwner);
      };
    };
  };

  public shared ({ caller }) func deleteOwner(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete owners");
    };

    if (not hotelOwners.containsKey(email)) {
      Runtime.trap("Owner does not exist");
    };
    hotelOwners.remove(email);
  };

  // Property operations
  public shared ({ caller }) func submitProperty(
    propertyName : Text,
    propertyType : Text,
    city : Text,
    address : Text,
    contactPhone : Text,
    description : Text,
    imageUrls : [Text],
    pricePerNight : Nat,
    amenities : [Text],
    rules : Text,
    checkinTime : Text,
    checkoutTime : Text,
    ownerEmail : Text,
  ) : async Property {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can submit properties");
    };

    // Verify the caller is the owner
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.email != ownerEmail and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only submit properties for your own account");
        };
        if (profile.userType != "owner" and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only hotel owners can submit properties");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: User profile not found");
        };
      };
    };

    let id = Time.now().toText() # propertyName # city;

    let property : Property = {
      id;
      propertyName;
      propertyType;
      city;
      address;
      contactPhone;
      description;
      imageUrls;
      pricePerNight;
      amenities;
      rules;
      checkinTime;
      checkoutTime;
      ownerEmail;
      status = "pending";
    };

    properties.add(id, property);
    property;
  };

  public shared ({ caller }) func approveProperty(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve properties");
    };

    switch (properties.get(id)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?property) {
        let updatedProperty : Property = { property with status = "approved" };
        properties.add(id, updatedProperty);
      };
    };
  };

  public shared ({ caller }) func rejectProperty(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject properties");
    };

    switch (properties.get(id)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?property) {
        let updatedProperty : Property = { property with status = "rejected" };
        properties.add(id, updatedProperty);
      };
    };
  };

  public query ({ caller }) func getAllApprovedProperties() : async [Property] {
    // Public - anyone can view approved properties
    properties.values().toArray().filter(
      func(p) { p.status == "approved" }
    );
  };

  public query ({ caller }) func getAllPendingProperties() : async [Property] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view pending properties");
    };

    properties.values().toArray().filter(
      func(p) { p.status == "pending" }
    );
  };

  public query ({ caller }) func getAllProperties() : async [Property] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all properties");
    };
    properties.values().toArray();
  };

  public query ({ caller }) func getPropertiesByOwner(ownerEmail : Text) : async [Property] {
    // Owner can view their own properties, admin can view any
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.email != ownerEmail and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own properties");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own properties");
        };
      };
    };

    properties.values().toArray().filter(
      func(p) { p.ownerEmail == ownerEmail }
    );
  };

  public query ({ caller }) func getPropertyById(id : Text) : async Property {
    // Public can view approved properties, owners can view their own, admins can view all
    switch (properties.get(id)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?property) {
        if (property.status != "approved") {
          // Not approved - check if owner or admin
          switch (userProfiles.get(caller)) {
            case (?profile) {
              if (profile.email != property.ownerEmail and not AccessControl.isAdmin(accessControlState, caller)) {
                Runtime.trap("Unauthorized: Property not available");
              };
            };
            case (null) {
              if (not AccessControl.isAdmin(accessControlState, caller)) {
                Runtime.trap("Unauthorized: Property not available");
              };
            };
          };
        };
        property;
      };
    };
  };

  public shared ({ caller }) func deleteProperty(id : Text) : async () {
    if (not properties.containsKey(id)) {
      Runtime.trap("Property does not exist");
    };

    // Owner can delete their own property, admin can delete any
    switch (properties.get(id)) {
      case (?property) {
        switch (userProfiles.get(caller)) {
          case (?profile) {
            if (profile.email != property.ownerEmail and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only delete your own properties");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only delete your own properties");
            };
          };
        };
      };
      case (null) {};
    };

    properties.remove(id);
  };

  // Booking operations
  public shared ({ caller }) func createBooking(
    propertyId : Text,
    stayName : Text,
    location : Text,
    checkin : Text,
    checkout : Text,
    guestName : Text,
    phone : Text,
    email : Text,
    guests : Nat,
  ) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create bookings");
    };

    // Verify the caller is the customer making the booking
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.email != email and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only create bookings for your own account");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: User profile not found");
        };
      };
    };

    let id = "HIDE-" # propertyId # stayName # checkin # Time.now().toText();
    let booking : Booking = {
      id;
      propertyId;
      stayName;
      location;
      checkin;
      checkout;
      guestName;
      phone;
      email;
      guests;
      status = "pending";
      createdAt = Time.now();
    };

    bookings.add(id, booking);
    booking;
  };

  public query ({ caller }) func getBookingById(id : Text) : async Booking {
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        // Customer can view their own booking, property owner can view bookings for their property, admin can view all
        switch (userProfiles.get(caller)) {
          case (?profile) {
            let isCustomer = profile.email == booking.email;
            var isOwner = false;
            
            switch (properties.get(booking.propertyId)) {
              case (?property) {
                isOwner := profile.email == property.ownerEmail;
              };
              case (null) {};
            };

            if (not isCustomer and not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own bookings or bookings for your properties");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own bookings");
            };
          };
        };
        booking;
      };
    };
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  public query ({ caller }) func getBookingsByCustomerEmail(email : Text) : async [Booking] {
    // Customer can view their own bookings, admin can view any
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.email != email and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own bookings");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own bookings");
        };
      };
    };

    bookings.values().toArray().filter(
      func(b) { b.email == email }
    );
  };

  public query ({ caller }) func getBookingsByPropertyId(propertyId : Text) : async [Booking] {
    // Property owner can view bookings for their property, admin can view any
    switch (properties.get(propertyId)) {
      case (?property) {
        switch (userProfiles.get(caller)) {
          case (?profile) {
            if (profile.email != property.ownerEmail and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view bookings for your own properties");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view bookings for your own properties");
            };
          };
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Property does not exist");
        };
      };
    };

    bookings.values().toArray().filter(
      func(b) { b.propertyId == propertyId }
    );
  };

  public shared ({ caller }) func updateBookingStatus(id : Text, newStatus : Text) : async () {
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        // Property owner can update status for their property bookings, customer can cancel their own, admin can update any
        switch (userProfiles.get(caller)) {
          case (?profile) {
            let isCustomer = profile.email == booking.email;
            var isOwner = false;
            
            switch (properties.get(booking.propertyId)) {
              case (?property) {
                isOwner := profile.email == property.ownerEmail;
              };
              case (null) {};
            };

            // Customer can only cancel their own bookings
            if (isCustomer and newStatus != "cancelled") {
              Runtime.trap("Unauthorized: Customers can only cancel bookings");
            };

            if (not isCustomer and not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only update bookings for your properties or your own bookings");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only update your own bookings");
            };
          };
        };

        let updatedBooking : Booking = { booking with status = newStatus };
        bookings.add(id, updatedBooking);
      };
    };
  };

  public shared ({ caller }) func deleteBooking(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete bookings");
    };

    if (not bookings.containsKey(id)) {
      Runtime.trap("Booking does not exist");
    };
    bookings.remove(id);
  };
};

