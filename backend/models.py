from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime

mongo = PyMongo()

def init_app(app):
    mongo.init_app(app)

# Helper function to convert MongoDB ObjectId to string
def serialize_object(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

# Transaction functions
# Transaction functions
def get_transactions():
    try:
        transactions = list(mongo.db.transactions.find().sort('date', -1))
        return [{**transaction, "_id": serialize_object(transaction["_id"])} for transaction in transactions]
    except Exception as e:
        print(f"Error getting transactions: {e}")
        return []

def get_transaction(transaction_id):
    try:
        transaction = mongo.db.transactions.find_one({"_id": ObjectId(transaction_id)})
        if transaction:
            transaction["_id"] = serialize_object(transaction["_id"])
        return transaction
    except (InvalidId, Exception) as e:
        print(f"Error getting transaction {transaction_id}: {e}")
        return None

def create_transaction(data):
    try:
        # Convert amount to float and validate
        data['amount'] = float(data['amount'])
        if data['amount'] <= 0:
            raise ValueError("Amount must be positive")

        # Validate date format
        if 'date' not in data:
            data['date'] = datetime.now().isoformat()

        # Validate required fields
        required_fields = ['amount', 'description', 'category', 'type']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        result = mongo.db.transactions.insert_one(data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating transaction: {e}")
        return None

def update_transaction(transaction_id, data):
    try:
        if 'amount' in data:
            data['amount'] = float(data['amount'])

        result = mongo.db.transactions.update_one(
            {"_id": ObjectId(transaction_id)},
            {"$set": data}
        )
        return result.modified_count > 0
    except (InvalidId, Exception) as e:
        print(f"Error updating transaction {transaction_id}: {e}")
        return False

def delete_transaction(transaction_id):
    try:
        result = mongo.db.transactions.delete_one({"_id": ObjectId(transaction_id)})
        return result.deleted_count > 0
    except (InvalidId, Exception) as e:
        print(f"Error deleting transaction {transaction_id}: {e}")
        return False


# Budget functions
def get_budgets():
    try:
        budgets = list(mongo.db.budgets.find())
        return [{**budget, "_id": serialize_object(budget["_id"])} for budget in budgets]
    except Exception as e:
        print(f"Error getting budgets: {e}")
        return []

def get_budget(budget_id):
    try:
        budget = mongo.db.budgets.find_one({"_id": ObjectId(budget_id)})
        if budget:
            budget["_id"] = serialize_object(budget["_id"])
        return budget
    except (InvalidId, Exception) as e:
        print(f"Error getting budget {budget_id}: {e}")
        return None

def create_budget(data):
    try:
        # Convert amount to float and validate
        data['amount'] = float(data['amount'])
        if data['amount'] <= 0:
            raise ValueError("Amount must be positive")
            
        # Validate required fields
        required_fields = ['amount', 'category', 'period']
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
                
        result = mongo.db.budgets.insert_one(data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating budget: {e}")
        return None

def update_budget(budget_id, data):
    try:
        if 'amount' in data:
            data['amount'] = float(data['amount'])
            
        result = mongo.db.budgets.update_one(
            {"_id": ObjectId(budget_id)},
            {"$set": data}
        )
        return result.modified_count > 0
    except (InvalidId, Exception) as e:
        print(f"Error updating budget {budget_id}: {e}")
        return False

def delete_budget(budget_id):
    try:
        result = mongo.db.budgets.delete_one({"_id": ObjectId(budget_id)})
        return result.deleted_count > 0
    except (InvalidId, Exception) as e:
        print(f"Error deleting budget {budget_id}: {e}")
        return False

# Category functions
def get_categories():
    try:
        categories = list(mongo.db.categories.find())
        return [{**category, "_id": serialize_object(category["_id"])} for category in categories]
    except Exception as e:
        print(f"Error getting categories: {e}")
        return []

def get_category(category_id):
    try:
        category = mongo.db.categories.find_one({"_id": ObjectId(category_id)})
        if category:
            category["_id"] = serialize_object(category["_id"])
        return category
    except (InvalidId, Exception) as e:
        print(f"Error getting category {category_id}: {e}")
        return None

def create_category(data):
    try:
        # Validate required fields
        if 'name' not in data or not data['name'].strip():
            raise ValueError("Category name is required")
            
        result = mongo.db.categories.insert_one(data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating category: {e}")
        return None

def update_category(category_id, data):
    try:
        # Validate required fields
        if 'name' not in data or not data['name'].strip():
            raise ValueError("Category name is required")
            
        result = mongo.db.categories.update_one(
            {"_id": ObjectId(category_id)},
            {"$set": data}
        )
        return result.modified_count > 0
    except (InvalidId, Exception) as e:
        print(f"Error updating category {category_id}: {e}")
        return False

def delete_category(category_id):
    try:
        result = mongo.db.categories.delete_one({"_id": ObjectId(category_id)})
        return result.deleted_count > 0
    except (InvalidId, Exception) as e:
        print(f"Error deleting category {category_id}: {e}")
        return False