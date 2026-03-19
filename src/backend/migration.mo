import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";

module {
  type OldCategory = {
    name : Text;
    description : Text;
  };

  type OldBooking = {
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

  type OldActor = {
    categories : Map.Map<Text, OldCategory>;
    allBookings : List.List<OldBooking>;
    hotelOwners : Map.Map<Text, {
      name : Text;
      email : Text;
      phone : Text;
      password : Text;
    }>;
    properties : Map.Map<Text, {
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
    }>;
    galleryImages : Map.Map<Nat, {
      id : Nat;
      title : Text;
      description : Text;
      blob : Blob;
      timestamp : Int;
    }>;
  };

  type CustomMap<K, V> = Map.Map<K, V>;

  type NewActor = {
    customers : CustomMap<Text, {
      name : Text;
      email : Text;
      phone : Text;
      password : Text;
      active : Bool;
    }>;
    hotelOwners : CustomMap<Text, {
      name : Text;
      email : Text;
      phone : Text;
      password : Text;
      active : Bool;
    }>;
    properties : CustomMap<Text, {
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
    }>;
    bookings : CustomMap<Text, {
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
    }>;
    userProfiles : CustomMap<Principal, {
      name : Text;
      email : Text;
      phone : Text;
      userType : Text;
    }>;
  };

  public func run(old : OldActor) : NewActor {
    let customers = Map.empty<Text, {
      name : Text;
      email : Text;
      phone : Text;
      password : Text;
      active : Bool;
    }>();

    let hotelOwners = old.hotelOwners.map<Text, { name : Text; email : Text; phone : Text; password : Text }, { name : Text; email : Text; phone : Text; password : Text; active : Bool }>(
      func(_email, oldOwner) {
        { oldOwner with active = true };
      }
    );

    let properties = old.properties.clone();
    let bookings = Map.empty<Text, {
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
    }>();

    let userProfiles = Map.empty<Principal, {
      name : Text;
      email : Text;
      phone : Text;
      userType : Text;
    }>();

    {
      customers;
      hotelOwners;
      properties;
      bookings;
      userProfiles;
    };
  };
};
