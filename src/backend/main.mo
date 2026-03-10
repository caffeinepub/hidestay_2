import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";



actor {
  type Category = {
    name : Text;
    description : Text;
  };

  module Category {
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      Text.compare(category1.name, category2.name);
    };
  };

  let categories = Map.empty<Text, Category>();

  public shared ({ caller }) func addCategory(name : Text, description : Text) : async () {
    if (categories.containsKey(name)) {
      Runtime.trap("Category already exists");
    };
    let category : Category = {
      name;
      description;
    };
    categories.add(name, category);
  };

  public query ({ caller }) func getCategory(name : Text) : async Category {
    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category does not exist") };
      case (?category) { category };
    };
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    categories.values().toArray().sort();
  };

  public shared ({ caller }) func deleteCategory(name : Text) : async () {
    if (not categories.containsKey(name)) {
      Runtime.trap("Category does not exist");
    };
    categories.remove(name);
  };

  // Booking system
  type Booking = {
    id : Text;
    stayName : Text;
    location : Text;
    checkin : Text;
    checkout : Text;
    guestName : Text;
    phone : Text;
    email : Text;
    guests : Nat;
    createdAt : Int;
  };

  let allBookings = List.empty<Booking>();

  public shared ({ caller }) func createBooking(
    stayName : Text,
    location : Text,
    checkin : Text,
    checkout : Text,
    guestName : Text,
    phone : Text,
    email : Text,
    guests : Nat,
  ) : async Booking {
    let id = "HIDE-" # stayName # checkin # Time.now().toText();

    let booking : Booking = {
      id;
      stayName;
      location;
      checkin;
      checkout;
      guestName;
      phone;
      email;
      guests;
      createdAt = Time.now();
    };

    allBookings.add(booking);
    booking;
  };

  public query ({ caller }) func getBooking(id : Text) : async Booking {
    switch (allBookings.find(func(b) { b.id == id })) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) { booking };
    };
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    allBookings.toArray();
  };
};
