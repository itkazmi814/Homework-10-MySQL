var mysql = require("mysql");
var inquirer = require("inquirer");

//create database connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
})

//connect to database
connection.connect( err => {
	if(err) throw err;
	startManager();
})

function startManager () {
	var promise = Promise.resolve();
	promise = promise
	.then( () => getCommand() )
	.then( answer => runCommand(answer) )	
}

function getCommand() {
	var question = {
		name: "command",
		type: "list",
		message: "What would you like to do?",
		choices: ["View Products for Sale",
				"View Low Inventory",
				"Add to Inventory",
				"Add New Product"]
	}
	return inquirer.prompt(question);
}

function runCommand(answer) {
	switch(answer.command){
		case "View Products for Sale":
			viewProductsForSale();
			break;

		case "View Low Inventory":
			viewLowInventory();
			break;

		case "Add to Inventory":
			addToInventory();
			break;

		case "Add New Product":
			addNewProduct();
			break;
	}
}

function viewProductsForSale () {
	connection.query("SELECT * FROM products",(err,res) => {
		if(err) throw err;
		
		console.log("");
		for(var i=0; i<res.length; i++){
			console.log(`ID: ${res[i].item_id}`);
			console.log(`Name: ${res[i].product_name}`);
			console.log(`Price: $${res[i].price}`);
			console.log(`Stock: ${res[i].stock_quantity}`);
			console.log("");
		}
		connection.end();
	})
}

function viewLowInventory () {
	connection.query("SELECT * FROM products HAVING stock_quantity < 5", (err,res) => {
		if(err) throw err;

		console.log("");
		console.log("The following products have an inventory count of less than five:");
		console.log("");

		for(var i=0; i<res.length; i++){
			console.log(`ID: ${res[i].item_id}  Name: ${res[i].product_name}  Stock: ${res[i].stock_quantity}`);
		}
		connection.end()
	})
}

function addToInventory (){
	console.log("add to inventory")
	connection.query("SELECT * FROM products", (err,res) => {
		if(err) throw err;
		
		return getProducts(res).then( products => userSelectsProduct(products) ).then( answer => restockInventory(answer) );

	})
}

function addNewProduct (){
	console.log("add new product");
	connection.end();
}

function getProducts(res) {
	var products = [];
	console.log("display products")
	
	for(var i=0; i< res.length; i++){
		products.push(`${res[i].item_id}. ${res[i].product_name}`);
	}
	console.log("returning products")
	return products;
} 

function userSelectsProduct (products) {
	var questions = [
		{
			name: "selectedProduct",
			type: "list",
			message: "What would you like to restock?",
			choices: products
		},{
			name: "orderAmount",
			type: "input",
			message: "How much would you like to restock?",
			validate: function(input) {
				if(isNaN(input) === false) {
					return true;
				}
				console.log("\nPlease enter a number")
				return false;
			}
		}
	];

	return inquirer.prompt(questions);
}

function restockInventory (answer) {
	console.log("restocking")
	console.log(answer)
	connection.end()
}