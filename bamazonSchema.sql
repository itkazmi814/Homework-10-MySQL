DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;
USE bamazon;

CREATE TABLE products(
item_id INTEGER(10) AUTO_INCREMENT NOT NULL,
product_name VARCHAR(50) NOT NULL,
department_name VARCHAR(50) NOT NULL,
price INTEGER(10) NULL,
stock_quantity INTEGER(10),
PRIMARY KEY (item_id)
);

INSERT INTO products (product_name,department_name,price,stock_quantity)
VALUES ("Sweater","Clothing",54,7), ("Tshirt","Clothing",23,12),("Toilet paper","Household",10,23),
("Towel","Household",8,2),("Webcam","Electronics",23,4),("HDMI Cable","Electronics",10,8),
("Banana","Grocery",2,14),("Potato","Grocery",3,17),("Monitor","Electronics",130,6),
("Dishsoap","Household",9,1);

SELECT * FROM products;