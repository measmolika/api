'use strict';
module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    data_of_birth: DataTypes.DATE
  }, {});
  Client.associate = function(models) {
    // associations can be defined here
  };
  return Client;
};