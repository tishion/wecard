'use strict'
module.exports = function _Cardcase(sequelize, DataTypes) {
    return sequelize.define(
        'Cardcase',
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
            }
        }
    );
};