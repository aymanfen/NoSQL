from flask import Blueprint, request, jsonify
from models import (
    get_transactions, get_transaction, create_transaction, update_transaction, delete_transaction,
    get_budgets, get_budget, create_budget, update_budget, delete_budget,
    get_categories, get_category, create_category, update_category, delete_category
)
from bson.objectid import ObjectId
from bson.errors import InvalidId

api = Blueprint('api', __name__)

# Transaction routes
@api.route('/transactions', methods=['GET'])
def get_all_transactions():
    transactions = get_transactions()
    return jsonify(transactions), 200

@api.route('/transactions/<transaction_id>', methods=['GET'])
def get_single_transaction(transaction_id):
    try:
        transaction = get_transaction(transaction_id)
        if transaction:
            return jsonify(transaction), 200
        return jsonify({"error": "Transaction not found"}), 404
    except InvalidId:
        return jsonify({"error": "Invalid transaction ID"}), 400

@api.route('/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    transaction_id = create_transaction(data)
    if transaction_id:
        return jsonify({
            "message": "Transaction created successfully",
            "transaction_id": transaction_id
        }), 201
    return jsonify({"error": "Failed to create transaction"}), 400

@api.route('/transactions/<transaction_id>', methods=['PUT'])
def edit_transaction(transaction_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    success = update_transaction(transaction_id, data)
    if success:
        return jsonify({"message": "Transaction updated successfully"}), 200
    return jsonify({"error": "Transaction not found or update failed"}), 404

@api.route('/transactions/<transaction_id>', methods=['DELETE'])
def remove_transaction(transaction_id):
    success = delete_transaction(transaction_id)
    if success:
        return jsonify({"message": "Transaction deleted successfully"}), 200
    return jsonify({"error": "Transaction not found or delete failed"}), 404

# Budget routes
@api.route('/budgets', methods=['GET'])
def get_all_budgets():
    budgets = get_budgets()
    return jsonify(budgets), 200

@api.route('/budgets/<budget_id>', methods=['GET'])
def get_single_budget(budget_id):
    try:
        budget = get_budget(budget_id)
        if budget:
            return jsonify(budget), 200
        return jsonify({"error": "Budget not found"}), 404
    except InvalidId:
        return jsonify({"error": "Invalid budget ID"}), 400

@api.route('/budgets', methods=['POST'])
def add_budget():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    budget_id = create_budget(data)
    if budget_id:
        return jsonify({
            "message": "Budget created successfully",
            "budget_id": budget_id
        }), 201
    return jsonify({"error": "Failed to create budget"}), 400

@api.route('/budgets/<budget_id>', methods=['PUT'])
def edit_budget(budget_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    success = update_budget(budget_id, data)
    if success:
        return jsonify({"message": "Budget updated successfully"}), 200
    return jsonify({"error": "Budget not found or update failed"}), 404

@api.route('/budgets/<budget_id>', methods=['DELETE'])
def remove_budget(budget_id):
    success = delete_budget(budget_id)
    if success:
        return jsonify({"message": "Budget deleted successfully"}), 200
    return jsonify({"error": "Budget not found or delete failed"}), 404

# Category routes
@api.route('/categories', methods=['GET'])
def get_all_categories():
    categories = get_categories()
    return jsonify(categories), 200

@api.route('/categories/<category_id>', methods=['GET'])
def get_single_category(category_id):
    try:
        category = get_category(category_id)
        if category:
            return jsonify(category), 200
        return jsonify({"error": "Category not found"}), 404
    except InvalidId:
        return jsonify({"error": "Invalid category ID"}), 400

@api.route('/categories', methods=['POST'])
def add_category():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    category_id = create_category(data)
    if category_id:
        return jsonify({
            "message": "Category created successfully",
            "category_id": category_id
        }), 201
    return jsonify({"error": "Failed to create category"}), 400

@api.route('/categories/<category_id>', methods=['PUT'])
def edit_category(category_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    success = update_category(category_id, data)
    if success:
        return jsonify({"message": "Category updated successfully"}), 200
    return jsonify({"error": "Category not found or update failed"}), 404

@api.route('/categories/<category_id>', methods=['DELETE'])
def remove_category(category_id):
    success = delete_category(category_id)
    if success:
        return jsonify({"message": "Category deleted successfully"}), 200
    return jsonify({"error": "Category not found or delete failed"}), 404