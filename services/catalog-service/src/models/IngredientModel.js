// services/catalog-service/src/models/IngredientModel.js
module.exports = (sequelize, DataTypes) => {
    const Ingredient = sequelize.define('Ingredient', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        nombre: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: true 
        },
        is_common: { 
            type: DataTypes.BOOLEAN, 
            defaultValue: false 
        } 
    }, { 
        timestamps: false 
    });

    return Ingredient;
};