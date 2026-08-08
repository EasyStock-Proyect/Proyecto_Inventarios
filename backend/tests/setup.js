process.env.NODE_ENV = "test";

process.env.DATABASE_URL =
    "mysql://root:admin@localhost:3306/inventarios_db_test";

process.env.JWT_SECRET =
    "inventarios_secret_2026";

process.env.JWT_REFRESH_SECRET =
    "inventarios_refresh_secret_2026";
