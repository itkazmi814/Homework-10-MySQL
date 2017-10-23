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

//connects to mySQL database
connection.connect( err => {
	if(err) throw err;
	getCommand();
})

//Asks user what they want to do
//This function is used for looping back to the main menu after completing an action
function getCommand() {
	var question = {
		name: "command",
		type: "list",
		message: "What would you like to do?",
		choices: ["Order products","Quit",]
	}

	inquirer.prompt(question).then( answer => {
		if(answer.command === "Order products"){
			return startCustomer();
		}else if(answer.command === "Quit"){
			console.log("Thank you for shopping with us.")
			connection.end();
		}	
	})
}

//Takes the user selection from getCommand
//Creates a promise chain
//look into async await. also look into let
function startCustomer() {
	connection.query("SELECT * FROM products", (err,res) => {
		if (err) throw err;

		var promise = Promise.resolve();
		promise = promise
		.then( () => getProducts(res) )
		.then( products => userSelectsProduct(products) )
		.then( answer => verifyOrderAmount(answer))
		.catch( err => console.error('Promise error', err))

	})
}

//Pulls the products table from mySQL database and stores it in an array
function getProducts(res) {
	var products = [];
	
	for(var i=0; i< res.length; i++){
		products.push(`${res[i].item_id}. ${res[i].product_name}`);
	}
	return products;
}

//Inquirer prompt asks user what product they want to order
//Uses the array pulled from products table to display possible choices to the user
function userSelectsProduct (products) {
	var questions = [
		{
			name: "selectedProduct",
			type: "list",
			message: "What would you like to order?",
			choices: products
		},{
			name: "orderAmount",
			type: "input",
			message: "How much would you like to order?",
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

//Takes the product the user is ordering
//Reads mysql database and checks amount of said product available
//Acts according to product availability
function verifyOrderAmount (answer) {
	var orderID = answer.selectedProduct.substring(0,answer.selectedProduct.indexOf("."));
	var orderAmount = answer.orderAmount; 

	connection.query("SELECT * FROM products WHERE ?",{item_id: orderID}, (err,res) => {
		if(err) throw(err);
		
		var available = res[0].stock_quantity;
		var unitPrice = res[0].price;
		var prodSales = res[0].product_sales;

		console.log("")
		console.log(`Buying: ${res[0].product_name} (Prod ID ${orderID})`)
		console.log(`Quantity: ${orderAmount}`)
		console.log(`Unit Price: $${unitPrice}`)
		console.log(`Available: ${res[0].stock_quantity}`)
		console.log("")

		if(res[0].stock_quantity >= orderAmount){
			placeOrder(orderID,orderAmount,available,unitPrice,prodSales);
		}else{
			console.log("Insufficient quantity! Order prevented.");
			console.log("");

			getCommand();
		}
	})

}

//Called if sufficient inventory to fulfill order
//Updates products table
function placeOrder(id,orderAmount,available,unitPrice,prodSales) {
	var totalPrice = orderAmount * unitPrice;

	connection.query(
		"UPDATE products SET ? WHERE ?",
		[{
			stock_quantity: (available-orderAmount),
			product_sales: (prodSales + totalPrice)
		},{
			item_id: id
		}],
		(err,res) => {
			console.log(`Placing order for item #${id}. Order Quantity: ${orderAmount}`)
			console.log(`Total Cost: $${totalPrice}`)
			console.log("")

			getCommand();
		}
	); 
}