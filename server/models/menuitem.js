import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class MenuItem extends Model {
    static associate(models) {
      // define association here
    }
  }

  MenuItem.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      available: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      image: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "MenuItem",
    }
  );

  return MenuItem;
};
