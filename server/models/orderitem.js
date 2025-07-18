import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // define association here
    }
  }

  OrderItem.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Orders",
          key: "id",
        },
      },
      menuItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "MenuItems",
          key: "id",
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
    }
  );

  return OrderItem;
};
