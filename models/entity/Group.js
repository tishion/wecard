'use strict'
module.exports = function _Group(sequelize, DataTypes) {
    return sequelize.define(
        'Group',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            wxGroupId: {
                type: DataTypes.CHAR,
                allowNull: false,
                unique: true
            },
            name: {
                type: DataTypes.CHAR,
                allowNull: false,
            }
        }
    );
};