module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        productId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        },
        productName: { 
            type: DataTypes.STRING, 
            allowNull: false 
        },
        quantity: { 
            type: DataTypes.INTEGER, 
            defaultValue: 1 
        },
        price: { 
            type: DataTypes.FLOAT, 
            allowNull: false 
        } // Guardamos el precio histórico al momento de la compra
    }, {
        timestamps: false
    });

    return OrderItem;
};