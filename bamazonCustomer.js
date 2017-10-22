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
	startCustomer();
})


function startCustomer() {
	//get data from DB
	connection.query("SELECT * FROM products", (err,res) => {
		if(err) throw err;

		var promise = Promise.resolve();
		promise = promise
		.then( () => getProducts(res) )
		.then( products => userSelectsProduct(products) )
		.then( answer => verifyOrderAmount(answer) )

	}) //end connection.query

}

//breaks if i have the connection.query occur here instead of in startCustomer
//seems like userSelectsProduct will run first
function getProducts(res) {
	var products = [];
	
	for(var i=0; i< res.length; i++){
		products.push(`${res[i].item_id}. ${res[i].product_name}`);
	}
	return products;
}

//get order product and amount
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

function verifyOrderAmount (answer) {
	var orderID = answer.selectedProduct.substring(0,answer.selectedProduct.indexOf("."));
	var orderAmount = answer.orderAmount; 

	connection.query("SELECT * FROM products WHERE ?",{item_id: orderID},(err,res) => {
		if(err) throw err;
		
		var available = res[0].stock_quantity;
		var unitPrice = res[0].price;
		console.log(orderID, orderAmount, available)

		console.log("")
		console.log(`Buying: ${res[0].product_name} (Prod ID ${orderID})`)
		console.log(`Quantity: ${orderAmount}`)
		console.log(`Unit Price: $${unitPrice}`)
		console.log(`Available: ${res[0].stock_quantity}`)
		console.log("")

		if(res[0].stock_quantity >= orderAmount){
			placeOrder(orderID,orderAmount,available,unitPrice);
		}else{
			//if stock < order quantity => reject order
			console.log("Insufficient quantity! Order prevented.");
			connection.end()
		}
	})
}

function placeOrder(id,orderAmount,available,unitPrice) {
	console.log(`Placing order for item #${id}. Quantity: ${orderAmount}`)

	connection.query(
		"UPDATE products SET ? WHERE ?",
		[{stock_quantity: (available-orderAmount)},{item_id: id}],
		(err,res) => {
			var totalPrice = orderAmount * unitPrice;
			console.log(`Total Cost: $${totalPrice}`)
			connection.end();
		}
	); 
}