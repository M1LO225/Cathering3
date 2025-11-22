const ColegioModel = require('../models/ColegioModel');
const UserModel = require('../models/UserModel');
const WalletModel = require('../models/WalletModel');
const TransactionModel = require('../models/TransactionModel');
const ProductModel = require('../models/ProductModel');
const IngredientModel = require('../models/IngredientModel');
const ProductIngredientModel = require('../models/ProductIngredientModel');

// 1. Colegio <-> Usuarios
ColegioModel.hasMany(UserModel, { foreignKey: 'colegio_id', as: 'usuarios' });
UserModel.belongsTo(ColegioModel, { foreignKey: 'colegio_id', as: 'colegio' });

// 2. Colegio <-> Productos (Menú)
ColegioModel.hasMany(ProductModel, { foreignKey: 'colegio_id', as: 'productos' });
ProductModel.belongsTo(ColegioModel, { foreignKey: 'colegio_id', as: 'colegio' });

// 3. Usuario <-> Wallet (1 a 1)
UserModel.hasOne(WalletModel, { foreignKey: 'user_id', as: 'wallet' });
WalletModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'owner' });

// 4. Wallet <-> Transactions (1 a N)
WalletModel.hasMany(TransactionModel, { foreignKey: 'wallet_id', as: 'transactions' });
TransactionModel.belongsTo(WalletModel, { foreignKey: 'wallet_id', as: 'wallet' });

// 5. Productos <-> Ingredientes (N a N)
ProductModel.belongsToMany(IngredientModel, { 
    through: ProductIngredientModel, 
    foreignKey: 'product_id',
    as: 'ingredientes'
});
IngredientModel.belongsToMany(ProductModel, { 
    through: ProductIngredientModel, 
    foreignKey: 'ingredient_id',
    as: 'productos'
});

// 6. Usuario (Alergias) <-> Ingredientes (N a N) - Reutilizamos el modelo Ingredient
// Creamos una tabla pivote automática 'UserAllergies'
UserModel.belongsToMany(IngredientModel, { 
    through: 'UserAllergies', 
    foreignKey: 'user_id',
    as: 'alergias'
});
IngredientModel.belongsToMany(UserModel, { 
    through: 'UserAllergies', 
    foreignKey: 'ingredient_id',
    as: 'alergicos'
});

module.exports = { 
    ColegioModel, UserModel, WalletModel, TransactionModel, ProductModel, IngredientModel 
};