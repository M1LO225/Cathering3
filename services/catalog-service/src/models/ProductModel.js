// services/catalog-service/src/models/ProductModel.js
module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        nombre: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        descripcion: { 
            type: DataTypes.STRING 
        },
        precio: { 
            type: DataTypes.FLOAT, 
            allowNull: false 
        },
        stock: { 
            type: DataTypes.INTEGER, 
            defaultValue: 0 
        }, 
        tiempo_prep: { 
            type: DataTypes.INTEGER 
        }, // En minutos
        imagen_url: { 
            type: DataTypes.STRING 
        }, 
        available_From: {
            type: DataTypes.DATEONLY
        },
        // Agregamos explícitamente la FK para evitar problemas
        colegioId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, { 
        timestamps: true 
    });

    return Product;
};