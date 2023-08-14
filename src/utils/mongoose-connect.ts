import mongoose from "mongoose";

type TMongoDBConnectionDetails = {
  username?: string;
  password?: string;
  host: string;
  port: number;
  name: string;
};

type TMongoDBConnectionString = string;

export default class MongooseConnect {
  private static dbDefaultAppName: string =
    process.env.MONGO_DB_NAME ?? "pia-project";

  private static defaultOptions: mongoose.ConnectOptions = {
    connectTimeoutMS: 1000,
    socketTimeoutMS: 1000,
    serverSelectionTimeoutMS: 1000,
    appName: process.env.npm_package_name ?? this.dbDefaultAppName,
  };

  static getConnectionDetailsFromEnv(): TMongoDBConnectionDetails {
    const {
      MONGO_DB_USERNAME,
      MONGO_DB_PASSWORD,
      MONGO_DB_HOST,
      MONGO_DB_NAME,
      MONGO_DB_PORT,
    } = process.env;

    return {
      host: MONGO_DB_HOST ?? "127.0.0.1",
      port: parseInt(MONGO_DB_PORT ?? "27017"),
      username: MONGO_DB_USERNAME,
      password: MONGO_DB_PASSWORD,
      name: MONGO_DB_NAME ?? `${this.dbDefaultAppName}-db`,
    };
  }

  public static initialize() {
    mongoose.set("strictQuery", true);
  }

  static buildConnectionURI(
    details: TMongoDBConnectionDetails,
  ): TMongoDBConnectionString {
    const { host, port, name, username = "", password = "" } = details;
    const authority =
      username !== "" && password !== "" ? `${username}:${password}@` : "";
    return `mongodb://${authority}${host}:${port}/${name}`;
  }

  public static async connect(
    connectionString: TMongoDBConnectionString,
    options?: mongoose.ConnectOptions,
  ) {
    return mongoose.connect(
      connectionString,
      Object.assign(this.defaultOptions, options),
    );
  }
}
