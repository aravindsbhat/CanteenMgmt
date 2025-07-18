import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // define association here
    }
  }

  Order.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
        validate: {
          isIn: [
            [
              "pending",
              "confirmed",
              "preparing",
              "ready",
              "delivered",
              "cancelled",
            ],
          ],
        },
      },
    },
    {
      sequelize,
      modelName: "Order",
    }
  );

  return Order;
};
