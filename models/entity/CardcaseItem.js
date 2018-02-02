'use strict'
module.exports = function _CardcaseItem(sequelize, DataTypes) {
    var CardcaseItem = sequelize.define(
        'CardcaseItem',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            cardcaseId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            itemId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            itemType: {
                type: DataTypes.ENUM('CARD', 'GROUP'),
                defaultValue: 'CARD',
                allowNull: false,
            }
        },
        {
            indexes: [{
                fields: ['cardcaseId', 'itemId', 'itemType'],
                unique: true
            }]
        }
    );

    CardcaseItem.associate = function (db) {
        CardcaseItem.belongsTo(db.Namecard, {
            as: 'Namecard', 
            foreignKey: 'itemId', 
            targetKey: 'id',
            constraints: false            
        });
        CardcaseItem.belongsTo(db.Group, {
            as: 'Group', 
            foreignKey: 'itemId', 
            targetKey: 'id',
            constraints: false            
        });
    }

    return CardcaseItem;
};