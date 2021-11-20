
const express = require("express");

const _ = require("lodash");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://paridhi:paridhi@cluster0.848am.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Java DsAlgo",
});

const item2 = new Item({
  name: "WebD Training",
});

const item3 = new Item({
  name: "College LabWork",
});

const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, function (error) {
        if (error) {
          console.log("Error!");
        } else {
          console.log("done!");
        }
      });
      res.redirect("/");
    } else {
      console.log(foundItems);
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save(function(err){
      if(!err){
        res.redirect("/");
      }
    });
    
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save(function(err){
        if(!err){
          res.redirect("/" + listName);
        }
      });
      
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err1, foundList) {
        if (!err1) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:id", function (req, res) {
  const customListName = _.capitalize(req.params.id);

  List.findOne({ name: customListName }, function (err, result) {
    if (!err) {
      if (!result) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save(function(err2){
          if(!err2){
            res.redirect("/" + customListName);
          }
        });
       
      } else {
        //Show an existing list

        res.render("list", {
          listTitle: result.name,
          newListItems: result.items,
        });
      }
    }
  });
});
app.get("/about", function (req, res) {
  res.render("about");
});

let port=process.env.PORT;
if(port==null ||port==""){
  port=3000;
}

app.listen(port, function () {
  console.log("Server started successfully");
});

// https://afternoon-earth-00359.herokuapp.com/