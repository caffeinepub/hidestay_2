import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type Category = {
    name : Text;
    description : Text;
  };

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

  type OldActor = {
    categories : Map.Map<Text, Category>;
  };

  type NewActor = {
    categories : Map.Map<Text, Category>;
    allBookings : List.List<Booking>;
  };

  public func run(old : OldActor) : NewActor {
    { old with allBookings = List.empty<Booking>() };
  };
};
