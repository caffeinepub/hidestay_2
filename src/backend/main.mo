import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
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
};
