import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

import Iter "mo:core/Iter";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  include MixinStorage();

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

  // Hotel Owner Logic
  type HotelOwner = {
    name : Text;
    email : Text;
    phone : Text;
    password : Text;
  };

  let hotelOwners = Map.empty<Text, HotelOwner>(); // Email as key

  public shared ({ caller }) func registerOwner(name : Text, email : Text, phone : Text, password : Text) : async HotelOwner {
    if (hotelOwners.containsKey(email)) {
      Runtime.trap("Email already registered");
    };
    let owner : HotelOwner = {
      name;
      email;
      phone;
      password;
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
        };
        owner;
      };
    };
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

  let properties = Map.empty<Text, Property>();

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

  public query ({ caller }) func getMyProperties(ownerEmail : Text) : async [Property] {
    properties.values().toArray().filter(
      func(p) { p.ownerEmail == ownerEmail }
    );
  };

  public query ({ caller }) func getAllPendingProperties() : async [Property] {
    properties.values().toArray().filter(
      func(p) { p.status == "pending" }
    );
  };

  public query ({ caller }) func getAllApprovedProperties() : async [Property] {
    properties.values().toArray().filter(
      func(p) { p.status == "approved" }
    );
  };

  public shared ({ caller }) func approveProperty(id : Text) : async () {
    switch (properties.get(id)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?property) {
        let updatedProperty : Property = { property with status = "approved" };
        properties.add(id, updatedProperty);
      };
    };
  };

  public shared ({ caller }) func rejectProperty(id : Text) : async () {
    switch (properties.get(id)) {
      case (null) { Runtime.trap("Property does not exist") };
      case (?property) {
        let updatedProperty : Property = { property with status = "rejected" };
        properties.add(id, updatedProperty);
      };
    };
  };

  // GALLERY LOGIC - using MixinStorage
  type GalleryImage = {
    id : Nat;
    title : Text;
    description : Text;
    blob : Storage.ExternalBlob;
    timestamp : Int;
  };

  let galleryImages = Map.empty<Nat, GalleryImage>();

  public shared ({ caller }) func uploadImage(title : Text, description : Text, blob : Storage.ExternalBlob) : async GalleryImage {
    let imageId = galleryImages.size() + 1;
    let image : GalleryImage = {
      id = imageId;
      title;
      description;
      blob;
      timestamp = Time.now();
    };
    galleryImages.add(imageId, image);
    image;
  };

  public query ({ caller }) func getImage(id : Nat) : async GalleryImage {
    switch (galleryImages.get(id)) {
      case (null) { Runtime.trap("Image does not exist") };
      case (?image) { image };
    };
  };

  public query ({ caller }) func getAllImages() : async [GalleryImage] {
    galleryImages.values().toArray();
  };

  public shared ({ caller }) func deleteImage(id : Nat) : async () {
    if (not galleryImages.containsKey(id)) {
      Runtime.trap("Image does not exist");
    };
    galleryImages.remove(id);
  };
};
