'use strict'
module.exports = function _Namecard(sequelize, DataTypes) {
    return sequelize.define(
        'Namecard',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false
            },
            cardType: {
                type: DataTypes.ENUM('WORK', 'STUDY'),
                defaultValue: 'WORK',
                allowNull: false
            },
            avatarUri: {
                type: DataTypes.CHAR,
            },
            name: {
                type: DataTypes.CHAR,
                allowNull: false
            },
            phone: {
                type: DataTypes.CHAR,
                allowNull: false
            },
            residence: {
                type: DataTypes.CHAR,
            },
            hometown: {
                type: DataTypes.CHAR,
            },
            company: {
                type: DataTypes.CHAR,
            },
            department: {
                type: DataTypes.CHAR,
            },
            occupation: {
                type: DataTypes.CHAR,
                allowNull: false
            },
            school: {
                type: DataTypes.CHAR,
            },
            major: {
                type: DataTypes.CHAR,
            },
            grade: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            exCompany: {
                type: DataTypes.CHAR,
            },
            exDepartment: {
                type: DataTypes.CHAR,
            },
            exOccupation: {
                type: DataTypes.CHAR,
            },
            interests: {
                type: DataTypes.STRING,
                set(value) {
                    this.setDataValue('interests', value.join(';'));
                },
                get() {
                    return this.getDataValue('interests').split(';');
                }
            },
            nonpublic: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            }
        },
        {
            getterMethods: {
                prune() {
                    var obj = this.dataValues;
                    delete obj.createdAt;
                    delete obj.updatedAt;
                    delete obj.deletedAt;
                    delete obj.version;
                    if ('WORK' == obj.cardType) {
                        delete obj.school;
                        delete obj.major;
                        delete obj.grade;
                    } else if ('STUDY' == obj.cardType) {
                        delete obj.company;
                        delete obj.department;
                        delete obj.occupation;
                        delete obj.exCompany;
                        delete obj.exDepartment;
                        delete obj.exOccupation;
                    }
                    obj.interests = this.interests;
                    return obj;
                }
            }
        }
    );
};