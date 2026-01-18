module.exports = (sequelize, DataTypes) => {
    const Wallet = sequelize.define('Wallet', {
        id: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        balance: { 
            type: DataTypes.FLOAT, 
            defaultValue: 0.00 
        },
        // userId único para asegurar una billetera por estudiante
        userId: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            unique: true 
        },
        pin: { 
            type: DataTypes.STRING,
            allowNull: true 
        }
    }, {
        timestamps: true
    });

    return Wallet;
};