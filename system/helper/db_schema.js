function oc_db_schema() {
    var tables;
    let schemas = {};
    schemas.push( {
        "name": "address",
        "field": {
            0: {
                "name": "address_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "firstname",
                "type": "varchar(32)",
                "not_null": true
            },
            3: {
                "name": "lastname",
                "type": "varchar(32)",
                "not_null": true
            },
            4: {
                "name": "company",
                "type": "varchar(60)",
                "not_null": true
            },
            5: {
                "name": "address_1",
                "type": "varchar(128)",
                "not_null": true
            },
            6: {
                "name": "address_2",
                "type": "varchar(128)",
                "not_null": true
            },
            7: {
                "name": "city",
                "type": "varchar(128)",
                "not_null": true
            },
            8: {
                "name": "postcode",
                "type": "varchar(10)",
                "not_null": true
            },
            9: {
                "name": "country_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            10: {
                "name": "zone_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            11: {
                "name": "custom_field",
                "type": "text",
                "not_null": true
            },
            12: {
                "name": "default",
                "type": "tinyint(1)",
                "not_null": true
            }
        },
        "primary": {
            0: "address_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            }
        },
        "index": {
            0: {
                "name": "customer_id",
                "key": {
                    0: "customer_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "address_format",
        "field": {
            0: {
                "name": "address_format_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            },
            2: {
                "name": "address_format",
                "type": "text",
                "not_null": true
            }
        },
        "primary": {
            0: "address_format_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "api",
        "field": {
            0: {
                "name": "api_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "username",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "key",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            5: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "api_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "api_ip",
        "field": {
            0: {
                "name": "api_ip_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "api_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            }
        },
        "primary": {
            0: "api_ip_id"
        },
        "foreign": {
            0: {
                "key": "api_id",
                "table": "api",
                "field": "api_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "api_session",
        "field": {
            0: {
                "name": "api_session_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "api_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "session_id",
                "type": "varchar(32)",
                "not_null": true
            },
            3: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            5: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "api_session_id"
        },
        "foreign": {
            0: {
                "key": "api_id",
                "table": "api",
                "field": "api_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "attribute",
        "field": {
            0: {
                "name": "attribute_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "attribute_group_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "attribute_id"
        },
        "foreign": {
            0: {
                "key": "attribute_group_id",
                "table": "attribute_group",
                "field": "attribute_group_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "attribute_description",
        "field": {
            0: {
                "name": "attribute_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "attribute_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "attribute_id",
                "table": "attribute",
                "field": "attribute_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "attribute_group",
        "field": {
            0: {
                "name": "attribute_group_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "attribute_group_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "attribute_group_description",
        "field": {
            0: {
                "name": "attribute_group_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "attribute_group_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "attribute_group_id",
                "table": "attribute_group",
                "field": "attribute_group_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "banner",
        "field": {
            0: {
                "name": "banner_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            }
        },
        "primary": {
            0: "banner_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "banner_image",
        "field": {
            0: {
                "name": "banner_image_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "banner_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "title",
                "type": "varchar(64)",
                "not_null": true
            },
            4: {
                "name": "link",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true,
                "default": "0"
            }
        },
        "primary": {
            0: "banner_image_id"
        },
        "foreign": {
            0: {
                "key": "banner_id",
                "table": "banner",
                "field": "banner_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "antispam",
        "field": {
            0: {
                "name": "antispam_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "keyword",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "antispam_id"
        },
        "index": {
            0: {
                "name": "keyword",
                "key": {
                    0: "keyword"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "article",
        "field": {
            0: {
                "name": "article_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "topic_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "author",
                "type": "varchar(64)",
                "not_null": true
            },
            3: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            5: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "article_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "article_comment",
        "field": {
            0: {
                "name": "article_comment_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "article_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "comment",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "status",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "article_comment_id"
        },
        "foreign": {
            0: {
                "key": "article_id",
                "table": "article",
                "field": "article_id"
            },
            1: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            }
        },
        "index": {
            0: {
                "name": "article_id",
                "key": {
                    0: "article_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "article_description",
        "field": {
            0: {
                "name": "article_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "name",
                "type": "varchar(255)",
                "not_null": true
            },
            4: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "tag",
                "type": "text",
                "not_null": true
            },
            6: {
                "name": "meta_title",
                "type": "varchar(255)",
                "not_null": true
            },
            7: {
                "name": "meta_description",
                "type": "varchar(255)",
                "not_null": true
            },
            8: {
                "name": "meta_keyword",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "article_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "index": {
            0: {
                "name": "name",
                "key": {
                    0: "name"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "article_to_layout",
        "field": {
            0: {
                "name": "article_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "layout_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "article_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "article_id",
                "table": "article",
                "field": "article_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            2: {
                "key": "layout_id",
                "table": "layout",
                "field": "layout_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "article_to_store",
        "field": {
            0: {
                "name": "article_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            }
        },
        "primary": {
            0: "article_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "article_id",
                "table": "article",
                "field": "article_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "topic",
        "field": {
            0: {
                "name": "topic_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            }
        },
        "primary": {
            0: "topic_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "topic_description",
        "field": {
            0: {
                "name": "topic_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "name",
                "type": "varchar(255)",
                "not_null": true
            },
            4: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "meta_title",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "meta_description",
                "type": "varchar(255)",
                "not_null": true
            },
            7: {
                "name": "meta_keyword",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "topic_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "index": {
            0: {
                "name": "name",
                "key": {
                    0: "name"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "topic_to_store",
        "field": {
            0: {
                "name": "topic_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            }
        },
        "primary": {
            0: "topic_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "topic_id",
                "table": "topic",
                "field": "topic_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "cart",
        "field": {
            0: {
                "name": "cart_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "api_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "session_id",
                "type": "varchar(32)",
                "not_null": true
            },
            4: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            5: {
                "name": "subscription_plan_id",
                "type": "Number",
                "not_null": true
            },
            6: {
                "name": "option",
                "type": "text",
                "not_null": true
            },
            7: {
                "name": "quantity",
                "type": "Number",
                "not_null": true
            },
            8: {
                "name": "override",
                "type": "tinyint(1)",
                "not_null": true
            },
            9: {
                "name": "price",
                "type": "decimal(15,4)",
                "not_null": true
            },
            10: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "cart_id"
        },
        "foreign": {
            0: {
                "key": "api_id",
                "table": "api",
                "field": "api_id"
            },
            1: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            2: {
                "key": "session_id",
                "table": "session",
                "field": "session_id"
            },
            3: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            4: {
                "key": "subscription_plan_id",
                "table": "subscription_plan",
                "field": "subscription_plan_id"
            }
        },
        "index": {
            0: {
                "name": "cart_id",
                "key": {
                    0: "api_id",
                    1: "customer_id",
                    2: "session_id",
                    3: "product_id",
                    4: "subscription_plan_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "category",
        "field": {
            0: {
                "name": "category_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            2: {
                "name": "parent_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            3: {
                "name": "top",
                "type": "tinyint(1)",
                "not_null": true
            },
            4: {
                "name": "column",
                "type": "Number",
                "not_null": true
            },
            5: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            6: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            7: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            8: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "category_id"
        },
        "index": {
            0: {
                "name": "parent_id",
                "key": {
                    0: "parent_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "category_description",
        "field": {
            0: {
                "name": "category_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "meta_title",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "meta_description",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "meta_keyword",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "category_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "index": {
            0: {
                "name": "name",
                "key": {
                    0: "name"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "category_filter",
        "field": {
            0: {
                "name": "category_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "filter_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "category_id",
            1: "filter_id"
        },
        "foreign": {
            0: {
                "key": "category_id",
                "table": "category",
                "field": "category_id"
            },
            1: {
                "key": "filter_id",
                "table": "filter",
                "field": "filter_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "category_path",
        "field": {
            0: {
                "name": "category_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "path_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "level",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "category_id",
            1: "path_id"
        },
        "foreign": {
            0: {
                "key": "category_id",
                "table": "category",
                "field": "category_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "category_to_layout",
        "field": {
            0: {
                "name": "category_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "layout_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "category_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "category_id",
                "table": "category",
                "field": "category_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            2: {
                "key": "layout_id",
                "table": "layout",
                "field": "layout_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "category_to_store",
        "field": {
            0: {
                "name": "category_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            }
        },
        "primary": {
            0: "category_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "category_id",
                "table": "category",
                "field": "category_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "country",
        "field": {
            0: {
                "name": "country_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            },
            2: {
                "name": "iso_code_2",
                "type": "varchar(2)",
                "not_null": true
            },
            3: {
                "name": "iso_code_3",
                "type": "varchar(3)",
                "not_null": true
            },
            4: {
                "name": "address_format_id",
                "type": "Number",
                "not_null": true
            },
            5: {
                "name": "postcode_required",
                "type": "tinyint(1)",
                "not_null": true
            },
            6: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "1"
            }
        },
        "primary": {
            0: "country_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "coupon",
        "field": {
            0: {
                "name": "coupon_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            },
            2: {
                "name": "code",
                "type": "varchar(20)",
                "not_null": true
            },
            3: {
                "name": "type",
                "type": "char(1)",
                "not_null": true
            },
            4: {
                "name": "discount",
                "type": "decimal(15,4)",
                "not_null": true
            },
            5: {
                "name": "logged",
                "type": "tinyint(1)",
                "not_null": true
            },
            6: {
                "name": "shipping",
                "type": "tinyint(1)",
                "not_null": true
            },
            7: {
                "name": "total",
                "type": "decimal(15,4)",
                "not_null": true
            },
            8: {
                "name": "date_start",
                "type": "date",
                "not_null": true
            },
            9: {
                "name": "date_end",
                "type": "date",
                "not_null": true
            },
            10: {
                "name": "uses_total",
                "type": "Number",
                "not_null": true
            },
            11: {
                "name": "uses_customer",
                "type": "Number",
                "not_null": true
            },
            12: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            13: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "coupon_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "coupon_category",
        "field": {
            0: {
                "name": "coupon_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "category_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "coupon_id",
            1: "category_id"
        },
        "foreign": {
            0: {
                "key": "coupon_id",
                "table": "coupon",
                "field": "coupon_id"
            },
            1: {
                "key": "category_id",
                "table": "category",
                "field": "category_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "coupon_history",
        "field": {
            0: {
                "name": "coupon_history_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "coupon_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "amount",
                "type": "decimal(15,4)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "coupon_history_id"
        },
        "foreign": {
            0: {
                "key": "coupon_id",
                "table": "coupon",
                "field": "coupon_id"
            },
            1: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            },
            2: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "coupon_product",
        "field": {
            0: {
                "name": "coupon_product_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "coupon_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "coupon_product_id"
        },
        "foreign": {
            0: {
                "key": "coupon_id",
                "table": "coupon",
                "field": "coupon_id"
            },
            1: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "cron",
        "field": {
            0: {
                "name": "cron_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "code",
                "type": "varchar(128)",
                "not_null": true
            },
            2: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "cycle",
                "type": "varchar(12)",
                "not_null": true
            },
            4: {
                "name": "action",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            6: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            7: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "cron_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "currency",
        "field": {
            0: {
                "name": "currency_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "title",
                "type": "varchar(32)",
                "not_null": true
            },
            2: {
                "name": "code",
                "type": "varchar(3)",
                "not_null": true
            },
            3: {
                "name": "symbol_left",
                "type": "varchar(12)",
                "not_null": true
            },
            4: {
                "name": "symbol_right",
                "type": "varchar(12)",
                "not_null": true
            },
            5: {
                "name": "decimal_place",
                "type": "Number",
                "not_null": true
            },
            6: {
                "name": "value",
                "type": "double(15,8)",
                "not_null": true
            },
            7: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            8: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "currency_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer",
        "field": {
            0: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            3: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "firstname",
                "type": "varchar(32)",
                "not_null": true
            },
            5: {
                "name": "lastname",
                "type": "varchar(32)",
                "not_null": true
            },
            6: {
                "name": "email",
                "type": "varchar(96)",
                "not_null": true
            },
            7: {
                "name": "telephone",
                "type": "varchar(32)",
                "not_null": true
            },
            8: {
                "name": "password",
                "type": "varchar(255)",
                "not_null": true
            },
            9: {
                "name": "custom_field",
                "type": "text",
                "not_null": true
            },
            10: {
                "name": "newsletter",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "0"
            },
            11: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            12: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            13: {
                "name": "safe",
                "type": "tinyint(1)",
                "not_null": true
            },
            14: {
                "name": "token",
                "type": "text",
                "not_null": true
            },
            15: {
                "name": "code",
                "type": "varchar(40)",
                "not_null": true
            },
            16: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_id"
        },
        "foreign": {
            0: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            2: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_activity",
        "field": {
            0: {
                "name": "customer_activity_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "key",
                "type": "varchar(64)",
                "not_null": true
            },
            3: {
                "name": "data",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_activity_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_affiliate",
        "field": {
            0: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "company",
                "type": "varchar(60)",
                "not_null": true
            },
            2: {
                "name": "website",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "tracking",
                "type": "varchar(64)",
                "not_null": true
            },
            4: {
                "name": "balance",
                "type": "decimal(15,4)",
                "not_null": true
            },
            5: {
                "name": "commission",
                "type": "decimal(4,2)",
                "not_null": true,
                "default": "0.00"
            },
            6: {
                "name": "tax",
                "type": "varchar(64)",
                "not_null": true
            },
            7: {
                "name": "payment_method",
                "type": "varchar(6)",
                "not_null": true
            },
            8: {
                "name": "cheque",
                "type": "varchar(100)",
                "not_null": true
            },
            9: {
                "name": "paypal",
                "type": "varchar(64)",
                "not_null": true
            },
            10: {
                "name": "bank_name",
                "type": "varchar(64)",
                "not_null": true
            },
            11: {
                "name": "bank_branch_number",
                "type": "varchar(64)",
                "not_null": true
            },
            12: {
                "name": "bank_swift_code",
                "type": "varchar(64)",
                "not_null": true
            },
            13: {
                "name": "bank_account_name",
                "type": "varchar(64)",
                "not_null": true
            },
            14: {
                "name": "bank_account_number",
                "type": "varchar(64)",
                "not_null": true
            },
            15: {
                "name": "custom_field",
                "type": "text",
                "not_null": true
            },
            16: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            17: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_affiliate_report",
        "field": {
            0: {
                "name": "customer_affiliate_report_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            4: {
                "name": "country",
                "type": "varchar(2)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_affiliate_report_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_approval",
        "field": {
            0: {
                "name": "customer_approval_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "type",
                "type": "varchar(9)",
                "not_null": true
            },
            3: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_approval_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_group",
        "field": {
            0: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "approval",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_group_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_group_description",
        "field": {
            0: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            },
            3: {
                "name": "description",
                "type": "text",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_group_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_history",
        "field": {
            0: {
                "name": "customer_history_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "comment",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_history_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_login",
        "field": {
            0: {
                "name": "customer_login_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "email",
                "type": "varchar(96)",
                "not_null": true
            },
            2: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            3: {
                "name": "total",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            5: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_login_id"
        },
        "index": {
            0: {
                "name": "email",
                "key": {
                    0: "email"
                }
            },
            1: {
                "name": "ip",
                "key": {
                    0: "ip"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_ip",
        "field": {
            0: {
                "name": "customer_ip_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            4: {
                "name": "country",
                "type": "varchar(2)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_ip_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "index": {
            0: {
                "name": "ip",
                "key": {
                    0: "ip"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_online",
        "field": {
            0: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "url",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "referer",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "ip"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_reward",
        "field": {
            0: {
                "name": "customer_reward_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "order_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            3: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "points",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_reward_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            1: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_transaction",
        "field": {
            0: {
                "name": "customer_transaction_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "amount",
                "type": "decimal(15,4)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_transaction_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            1: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_search",
        "field": {
            0: {
                "name": "customer_search_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "keyword",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "category_id",
                "type": "Number",
                "not_null": true
            },
            6: {
                "name": "sub_category",
                "type": "tinyint(1)",
                "not_null": true
            },
            7: {
                "name": "description",
                "type": "tinyint(1)",
                "not_null": true
            },
            8: {
                "name": "products",
                "type": "Number",
                "not_null": true
            },
            9: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            10: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_search_id"
        },
        "foreign": {
            0: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            },
            2: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            3: {
                "key": "category_id",
                "table": "category",
                "field": "category_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "customer_wishlist",
        "field": {
            0: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "customer_id",
            1: "product_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            1: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "custom_field",
        "field": {
            0: {
                "name": "custom_field_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "type",
                "type": "varchar(32)",
                "not_null": true
            },
            2: {
                "name": "value",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "validation",
                "type": "varchar(255)",
                "not_null": true
            },
            4: {
                "name": "location",
                "type": "varchar(10)",
                "not_null": true
            },
            5: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            6: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "custom_field_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "custom_field_customer_group",
        "field": {
            0: {
                "name": "custom_field_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "required",
                "type": "tinyint(1)",
                "not_null": true
            }
        },
        "primary": {
            0: "custom_field_id",
            1: "customer_group_id"
        },
        "foreign": {
            0: {
                "key": "custom_field_id",
                "table": "custom_field",
                "field": "custom_field_id"
            },
            1: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "custom_field_description",
        "field": {
            0: {
                "name": "custom_field_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            }
        },
        "primary": {
            0: "custom_field_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "custom_field_id",
                "table": "custom_field",
                "field": "custom_field_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "custom_field_value",
        "field": {
            0: {
                "name": "custom_field_value_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "custom_field_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "custom_field_value_id"
        },
        "foreign": {
            0: {
                "key": "custom_field_id",
                "table": "custom_field",
                "field": "custom_field_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "custom_field_value_description",
        "field": {
            0: {
                "name": "custom_field_value_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "custom_field_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            }
        },
        "primary": {
            0: "custom_field_value_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            },
            1: {
                "key": "custom_field_id",
                "table": "custom_field",
                "field": "custom_field_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "download",
        "field": {
            0: {
                "name": "download_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "filename",
                "type": "varchar(160)",
                "not_null": true
            },
            2: {
                "name": "mask",
                "type": "varchar(128)",
                "not_null": true
            },
            3: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "download_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "download_description",
        "field": {
            0: {
                "name": "download_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "download_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "download_report",
        "field": {
            0: {
                "name": "download_report_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "download_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            4: {
                "name": "country",
                "type": "varchar(2)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "download_report_id"
        },
        "foreign": {
            0: {
                "key": "download_id",
                "table": "download",
                "field": "download_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "event",
        "field": {
            0: {
                "name": "event_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "code",
                "type": "varchar(128)",
                "not_null": true
            },
            2: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "trigger",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "action",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "0"
            },
            6: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true,
                "default": "1"
            }
        },
        "primary": {
            0: "event_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "extension",
        "field": {
            0: {
                "name": "extension_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "extension",
                "type": "varchar(255)",
                "not_null": true
            },
            2: {
                "name": "type",
                "type": "varchar(32)",
                "not_null": true
            },
            3: {
                "name": "code",
                "type": "varchar(128)",
                "not_null": true
            }
        },
        "primary": {
            0: "extension_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "extension_install",
        "field": {
            0: {
                "name": "extension_install_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "extension_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "extension_download_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            },
            4: {
                "name": "code",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "version",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "author",
                "type": "varchar(255)",
                "not_null": true
            },
            7: {
                "name": "link",
                "type": "varchar(255)",
                "not_null": true
            },
            8: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            9: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "extension_install_id"
        },
        "foreign": {
            0: {
                "key": "extension_id",
                "table": "extension",
                "field": "extension_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "extension_path",
        "field": {
            0: {
                "name": "extension_path_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "extension_install_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "path",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "extension_path_id"
        },
        "foreign": {
            0: {
                "key": "extension_install_id",
                "table": "extension_install",
                "field": "extension_install_id"
            }
        },
        "index": {
            0: {
                "name": "path",
                "key": {
                    0: "path"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "filter",
        "field": {
            0: {
                "name": "filter_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "filter_group_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "filter_id"
        },
        "foreign": {
            0: {
                "key": "filter_group_id",
                "table": "filter_group",
                "field": "filter_group_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "filter_description",
        "field": {
            0: {
                "name": "filter_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "filter_group_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "filter_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            },
            1: {
                "key": "filter_group_id",
                "table": "filter_group",
                "field": "filter_group_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "filter_group",
        "field": {
            0: {
                "name": "filter_group_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "filter_group_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "filter_group_description",
        "field": {
            0: {
                "name": "filter_group_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "filter_group_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "filter_group_id",
                "table": "filter_group",
                "field": "filter_group_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "gdpr",
        "field": {
            0: {
                "name": "gdpr_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "code",
                "type": "varchar(40)",
                "not_null": true
            },
            4: {
                "name": "email",
                "type": "varchar(96)",
                "not_null": true
            },
            5: {
                "name": "action",
                "type": "varchar(6)",
                "not_null": true
            },
            6: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            7: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "gdpr_id"
        },
        "foreign": {
            0: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "geo_zone",
        "field": {
            0: {
                "name": "geo_zone_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            },
            2: {
                "name": "description",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            4: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "geo_zone_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "information",
        "field": {
            0: {
                "name": "information_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "bottom",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            3: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "1"
            }
        },
        "primary": {
            0: "information_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "information_description",
        "field": {
            0: {
                "name": "information_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "title",
                "type": "varchar(64)",
                "not_null": true
            },
            3: {
                "name": "description",
                "type": "mediumtext",
                "not_null": true
            },
            4: {
                "name": "meta_title",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "meta_description",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "meta_keyword",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "information_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "information_to_layout",
        "field": {
            0: {
                "name": "information_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "layout_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "information_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "information_id",
                "table": "information",
                "field": "information_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            2: {
                "key": "layout_id",
                "table": "layout",
                "field": "layout_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "information_to_store",
        "field": {
            0: {
                "name": "information_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "information_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "information_id",
                "table": "information",
                "field": "information_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "language",
        "field": {
            0: {
                "name": "language_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            },
            2: {
                "name": "code",
                "type": "varchar(5)",
                "not_null": true
            },
            3: {
                "name": "locale",
                "type": "varchar(255)",
                "not_null": true
            },
            4: {
                "name": "extension",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            6: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            }
        },
        "primary": {
            0: "language_id"
        },
        "index": {
            0: {
                "name": "name",
                "key": {
                    0: "name"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "layout",
        "field": {
            0: {
                "name": "layout_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "layout_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "layout_module",
        "field": {
            0: {
                "name": "layout_module_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "layout_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "code",
                "type": "varchar(64)",
                "not_null": true
            },
            3: {
                "name": "position",
                "type": "varchar(14)",
                "not_null": true
            },
            4: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "layout_module_id"
        },
        "foreign": {
            0: {
                "key": "layout_id",
                "table": "layout",
                "field": "layout_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "layout_route",
        "field": {
            0: {
                "name": "layout_route_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "layout_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "route",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "layout_route_id"
        },
        "foreign": {
            0: {
                "key": "layout_id",
                "table": "layout",
                "field": "layout_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "length_class",
        "field": {
            0: {
                "name": "length_class_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "value",
                "type": "decimal(15,8)",
                "not_null": true
            }
        },
        "primary": {
            0: "length_class_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "length_class_description",
        "field": {
            0: {
                "name": "length_class_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "title",
                "type": "varchar(32)",
                "not_null": true
            },
            3: {
                "name": "unit",
                "type": "varchar(4)",
                "not_null": true
            }
        },
        "primary": {
            0: "length_class_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "length_class_id",
                "table": "length_class",
                "field": "length_class_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "location",
        "field": {
            0: {
                "name": "location_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            },
            2: {
                "name": "address",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "telephone",
                "type": "varchar(32)",
                "not_null": true
            },
            4: {
                "name": "geocode",
                "type": "varchar(32)",
                "not_null": true
            },
            5: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "open",
                "type": "text",
                "not_null": true
            },
            7: {
                "name": "comment",
                "type": "text",
                "not_null": true
            }
        },
        "primary": {
            0: "location_id"
        },
        "index": {
            0: {
                "name": "name",
                "key": {
                    0: "name"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "manufacturer",
        "field": {
            0: {
                "name": "manufacturer_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "manufacturer_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "manufacturer_to_layout",
        "field": {
            0: {
                "name": "manufacturer_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "layout_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "manufacturer_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "manufacturer_id",
                "table": "manufacturer",
                "field": "manufacturer_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            2: {
                "key": "layout_id",
                "table": "layout",
                "field": "layout_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "manufacturer_to_store",
        "field": {
            0: {
                "name": "manufacturer_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "manufacturer_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "manufacturer_id",
                "table": "manufacturer",
                "field": "manufacturer_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "marketing",
        "field": {
            0: {
                "name": "marketing_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            },
            2: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "code",
                "type": "varchar(64)",
                "not_null": true
            },
            4: {
                "name": "clicks",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "marketing_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "marketing_report",
        "field": {
            0: {
                "name": "marketing_report_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "marketing_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            4: {
                "name": "country",
                "type": "varchar(2)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "marketing_report_id"
        },
        "foreign": {
            0: {
                "key": "marketing_id",
                "table": "marketing",
                "field": "marketing_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "module",
        "field": {
            0: {
                "name": "module_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "code",
                "type": "varchar(64)",
                "not_null": true
            },
            3: {
                "name": "setting",
                "type": "text",
                "not_null": true
            }
        },
        "primary": {
            0: "module_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "notification",
        "field": {
            0: {
                "name": "notification_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "title",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "text",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "status",
                "type": "tinyint(11)",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "notification_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "option",
        "field": {
            0: {
                "name": "option_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "type",
                "type": "varchar(32)",
                "not_null": true
            },
            2: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "option_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "option_description",
        "field": {
            0: {
                "name": "option_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            }
        },
        "primary": {
            0: "option_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "option_value",
        "field": {
            0: {
                "name": "option_value_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "option_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "option_value_id"
        },
        "foreign": {
            0: {
                "key": "option_id",
                "table": "option",
                "field": "option_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "option_value_description",
        "field": {
            0: {
                "name": "option_value_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "option_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            }
        },
        "primary": {
            0: "option_value_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            },
            1: {
                "key": "option_id",
                "table": "option",
                "field": "option_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "order",
        "field": {
            0: {
                "name": "order_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "subscription_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "invoice_no",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            3: {
                "name": "invoice_prefix",
                "type": "varchar(26)",
                "not_null": true
            },
            4: {
                "name": "transaction_id",
                "type": "varchar(100)",
                "not_null": true
            },
            5: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            6: {
                "name": "store_name",
                "type": "varchar(64)",
                "not_null": true
            },
            7: {
                "name": "store_url",
                "type": "varchar(255)",
                "not_null": true
            },
            8: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            9: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            10: {
                "name": "firstname",
                "type": "varchar(32)",
                "not_null": true
            },
            11: {
                "name": "lastname",
                "type": "varchar(32)",
                "not_null": true
            },
            12: {
                "name": "email",
                "type": "varchar(96)",
                "not_null": true
            },
            13: {
                "name": "telephone",
                "type": "varchar(32)",
                "not_null": true
            },
            14: {
                "name": "custom_field",
                "type": "text",
                "not_null": true
            },
            15: {
                "name": "payment_address_id",
                "type": "Number",
                "not_null": true
            },
            16: {
                "name": "payment_firstname",
                "type": "varchar(32)",
                "not_null": true
            },
            17: {
                "name": "payment_lastname",
                "type": "varchar(32)",
                "not_null": true
            },
            18: {
                "name": "payment_company",
                "type": "varchar(60)",
                "not_null": true
            },
            19: {
                "name": "payment_address_1",
                "type": "varchar(128)",
                "not_null": true
            },
            20: {
                "name": "payment_address_2",
                "type": "varchar(128)",
                "not_null": true
            },
            21: {
                "name": "payment_city",
                "type": "varchar(128)",
                "not_null": true
            },
            22: {
                "name": "payment_postcode",
                "type": "varchar(10)",
                "not_null": true
            },
            23: {
                "name": "payment_country",
                "type": "varchar(128)",
                "not_null": true
            },
            24: {
                "name": "payment_country_id",
                "type": "Number",
                "not_null": true
            },
            25: {
                "name": "payment_zone",
                "type": "varchar(128)",
                "not_null": true
            },
            26: {
                "name": "payment_zone_id",
                "type": "Number",
                "not_null": true
            },
            27: {
                "name": "payment_address_format",
                "type": "text",
                "not_null": true
            },
            28: {
                "name": "payment_custom_field",
                "type": "text",
                "not_null": true
            },
            29: {
                "name": "payment_method",
                "type": "text",
                "not_null": true
            },
            30: {
                "name": "shipping_address_id",
                "type": "Number",
                "not_null": true
            },
            31: {
                "name": "shipping_firstname",
                "type": "varchar(32)",
                "not_null": true
            },
            32: {
                "name": "shipping_lastname",
                "type": "varchar(32)",
                "not_null": true
            },
            33: {
                "name": "shipping_company",
                "type": "varchar(60)",
                "not_null": true
            },
            34: {
                "name": "shipping_address_1",
                "type": "varchar(128)",
                "not_null": true
            },
            35: {
                "name": "shipping_address_2",
                "type": "varchar(128)",
                "not_null": true
            },
            36: {
                "name": "shipping_city",
                "type": "varchar(128)",
                "not_null": true
            },
            37: {
                "name": "shipping_postcode",
                "type": "varchar(10)",
                "not_null": true
            },
            38: {
                "name": "shipping_country",
                "type": "varchar(128)",
                "not_null": true
            },
            39: {
                "name": "shipping_country_id",
                "type": "Number",
                "not_null": true
            },
            40: {
                "name": "shipping_zone",
                "type": "varchar(128)",
                "not_null": true
            },
            41: {
                "name": "shipping_zone_id",
                "type": "Number",
                "not_null": true
            },
            42: {
                "name": "shipping_address_format",
                "type": "text",
                "not_null": true
            },
            43: {
                "name": "shipping_custom_field",
                "type": "text",
                "not_null": true
            },
            44: {
                "name": "shipping_method",
                "type": "text",
                "not_null": true
            },
            45: {
                "name": "comment",
                "type": "text",
                "not_null": true
            },
            46: {
                "name": "total",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            47: {
                "name": "order_status_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            48: {
                "name": "affiliate_id",
                "type": "Number",
                "not_null": true
            },
            49: {
                "name": "commission",
                "type": "decimal(15,4)",
                "not_null": true
            },
            50: {
                "name": "marketing_id",
                "type": "Number",
                "not_null": true
            },
            51: {
                "name": "tracking",
                "type": "varchar(64)",
                "not_null": true
            },
            52: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            53: {
                "name": "language_code",
                "type": "varchar(5)",
                "not_null": true
            },
            54: {
                "name": "currency_id",
                "type": "Number",
                "not_null": true
            },
            55: {
                "name": "currency_code",
                "type": "varchar(3)",
                "not_null": true
            },
            56: {
                "name": "currency_value",
                "type": "decimal(15,8)",
                "not_null": true,
                "default": "1.00000000"
            },
            57: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            58: {
                "name": "forwarded_ip",
                "type": "varchar(40)",
                "not_null": true
            },
            59: {
                "name": "user_agent",
                "type": "varchar(255)",
                "not_null": true
            },
            60: {
                "name": "accept_language",
                "type": "varchar(255)",
                "not_null": true
            },
            61: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            62: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "order_id"
        },
        "foreign": {
            0: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            1: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            2: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            },
            3: {
                "key": "payment_country_id",
                "table": "country",
                "field": "country_id"
            },
            4: {
                "key": "payment_zone_id",
                "table": "zone",
                "field": "zone_id"
            },
            5: {
                "key": "shipping_country_id",
                "table": "country",
                "field": "country_id"
            },
            6: {
                "key": "shipping_zone_id",
                "table": "zone",
                "field": "zone_id"
            },
            7: {
                "key": "order_status_id",
                "table": "order_status",
                "field": "order_status_id"
            },
            8: {
                "key": "affiliate_id",
                "table": "customer_affiliate",
                "field": "customer_id"
            },
            9: {
                "key": "marketing_id",
                "table": "marketing",
                "field": "marketing_id"
            },
            10: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            },
            11: {
                "key": "currency_id",
                "table": "currency",
                "field": "currency_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "order_history",
        "field": {
            0: {
                "name": "order_history_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "order_status_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "notify",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "0"
            },
            4: {
                "name": "comment",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "order_history_id"
        },
        "foreign": {
            0: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            },
            1: {
                "key": "order_status_id",
                "table": "order_status",
                "field": "order_status_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "order_option",
        "field": {
            0: {
                "name": "order_option_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "order_product_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "product_option_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "product_option_value_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            5: {
                "name": "name",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "value",
                "type": "text",
                "not_null": true
            },
            7: {
                "name": "type",
                "type": "varchar(32)",
                "not_null": true
            }
        },
        "primary": {
            0: "order_option_id"
        },
        "foreign": {
            0: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            },
            1: {
                "key": "order_product_id",
                "table": "order_product",
                "field": "order_product_id"
            },
            2: {
                "key": "product_option_id",
                "table": "product_option",
                "field": "product_option_id"
            },
            3: {
                "key": "product_option_value_id",
                "table": "product_option_value",
                "field": "product_option_value_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "order_product",
        "field": {
            0: {
                "name": "order_product_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "master_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "name",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "model",
                "type": "varchar(64)",
                "not_null": true
            },
            6: {
                "name": "quantity",
                "type": "Number",
                "not_null": true
            },
            7: {
                "name": "price",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            8: {
                "name": "total",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            9: {
                "name": "tax",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            10: {
                "name": "reward",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "order_product_id"
        },
        "foreign": {
            0: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            },
            1: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            2: {
                "key": "master_id",
                "table": "product",
                "field": "product_id"
            }
        },
        "index": {
            0: {
                "name": "order_id",
                "key": {
                    0: "order_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "order_subscription",
        "field": {
            0: {
                "name": "order_subscription_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_product_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "subscription_plan_id",
                "type": "Number",
                "not_null": true
            },
            5: {
                "name": "trial_price",
                "type": "decimal(10,4)",
                "not_null": true
            },
            6: {
                "name": "trial_tax",
                "type": "decimal(15,4)",
                "not_null": true
            },
            7: {
                "name": "trial_frequency",
                "type": "enum('day','week','semi_month','month','year')",
                "not_null": true
            },
            8: {
                "name": "trial_cycle",
                "type": "smallint(6)",
                "not_null": true
            },
            9: {
                "name": "trial_duration",
                "type": "smallint(6)",
                "not_null": true
            },
            10: {
                "name": "trial_remaining",
                "type": "smallint(6)",
                "not_null": true
            },
            11: {
                "name": "trial_status",
                "type": "tinyint(1)",
                "not_null": true
            },
            12: {
                "name": "price",
                "type": "decimal(10,4)",
                "not_null": true
            },
            13: {
                "name": "tax",
                "type": "decimal(15,4)",
                "not_null": true
            },
            14: {
                "name": "frequency",
                "type": "enum('day','week','semi_month','month','year')",
                "not_null": true
            },
            15: {
                "name": "cycle",
                "type": "smallint(6)",
                "not_null": true
            },
            16: {
                "name": "duration",
                "type": "smallint(6)",
                "not_null": true
            }
        },
        "primary": {
            0: "order_subscription_id"
        },
        "foreign": {
            0: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            },
            1: {
                "key": "order_product_id",
                "table": "order_product",
                "field": "order_product_id"
            },
            2: {
                "key": "subscription_plan_id",
                "table": "subscription_plan",
                "field": "subscription_plan_id"
            },
            3: {
                "key": "subscription_status_id",
                "table": "subscription_status",
                "field": "subscription_status_id"
            }
        },
        "index": {
            0: {
                "name": "order_id",
                "key": {
                    0: "order_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "order_status",
        "field": {
            0: {
                "name": "order_status_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            }
        },
        "primary": {
            0: "order_status_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "order_total",
        "field": {
            0: {
                "name": "order_total_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "extension",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "code",
                "type": "varchar(32)",
                "not_null": true
            },
            4: {
                "name": "title",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "value",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            6: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "order_total_id"
        },
        "foreign": {
            0: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            }
        },
        "index": {
            0: {
                "name": "order_id",
                "key": {
                    0: "order_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "order_voucher",
        "field": {
            0: {
                "name": "order_voucher_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "voucher_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "description",
                "type": "varchar(255)",
                "not_null": true
            },
            4: {
                "name": "code",
                "type": "varchar(10)",
                "not_null": true
            },
            5: {
                "name": "from_name",
                "type": "varchar(64)",
                "not_null": true
            },
            6: {
                "name": "from_email",
                "type": "varchar(96)",
                "not_null": true
            },
            7: {
                "name": "to_name",
                "type": "varchar(64)",
                "not_null": true
            },
            8: {
                "name": "to_email",
                "type": "varchar(96)",
                "not_null": true
            },
            9: {
                "name": "voucher_theme_id",
                "type": "Number",
                "not_null": true
            },
            10: {
                "name": "message",
                "type": "text",
                "not_null": true
            },
            11: {
                "name": "amount",
                "type": "decimal(15,4)",
                "not_null": true
            }
        },
        "primary": {
            0: "order_voucher_id"
        },
        "foreign": {
            0: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            },
            1: {
                "key": "voucher_id",
                "table": "voucher",
                "field": "voucher_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "master_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "model",
                "type": "varchar(64)",
                "not_null": true
            },
            3: {
                "name": "sku",
                "type": "varchar(64)",
                "not_null": true
            },
            4: {
                "name": "upc",
                "type": "varchar(12)",
                "not_null": true
            },
            5: {
                "name": "ean",
                "type": "varchar(14)",
                "not_null": true
            },
            6: {
                "name": "jan",
                "type": "varchar(13)",
                "not_null": true
            },
            7: {
                "name": "isbn",
                "type": "varchar(17)",
                "not_null": true
            },
            8: {
                "name": "mpn",
                "type": "varchar(64)",
                "not_null": true
            },
            9: {
                "name": "location",
                "type": "varchar(128)",
                "not_null": true
            },
            10: {
                "name": "variant",
                "type": "text",
                "not_null": true,
                "default": ""
            },
            11: {
                "name": "override",
                "type": "text",
                "not_null": true,
                "default": ""
            },
            12: {
                "name": "quantity",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            13: {
                "name": "stock_status_id",
                "type": "Number",
                "not_null": true
            },
            14: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            15: {
                "name": "manufacturer_id",
                "type": "Number",
                "not_null": true
            },
            16: {
                "name": "shipping",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "1"
            },
            17: {
                "name": "price",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            18: {
                "name": "points",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            19: {
                "name": "tax_class_id",
                "type": "Number",
                "not_null": true
            },
            20: {
                "name": "date_available",
                "type": "date",
                "not_null": true
            },
            21: {
                "name": "weight",
                "type": "decimal(15,8)",
                "not_null": true,
                "default": "0.00000000"
            },
            22: {
                "name": "weight_class_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            23: {
                "name": "length",
                "type": "decimal(15,8)",
                "not_null": true,
                "default": "0.00000000"
            },
            24: {
                "name": "width",
                "type": "decimal(15,8)",
                "not_null": true,
                "default": "0.00000000"
            },
            25: {
                "name": "height",
                "type": "decimal(15,8)",
                "not_null": true,
                "default": "0.00000000"
            },
            26: {
                "name": "length_class_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            27: {
                "name": "subtract",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "1"
            },
            28: {
                "name": "minimum",
                "type": "Number",
                "not_null": true,
                "default": "1"
            },
            29: {
                "name": "rating",
                "type": "Number",
                "not_null": true
            },
            30: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            31: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "0"
            },
            32: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            33: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id"
        },
        "foreign": {
            0: {
                "key": "master_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "stock_status_id",
                "table": "stock_status",
                "field": "stock_status_id"
            },
            2: {
                "key": "manufacturer_id",
                "table": "manufacturer",
                "field": "manufacturer_id"
            },
            3: {
                "key": "tax_class_id",
                "table": "tax_class",
                "field": "tax_class_id"
            },
            4: {
                "key": "weight_class_id",
                "table": "weight_class",
                "field": "weight_class_id"
            },
            5: {
                "key": "length_class_id",
                "table": "length_class",
                "field": "length_class_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_attribute",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "attribute_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "text",
                "type": "text",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id",
            1: "attribute_id",
            2: "language_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "attribute_id",
                "table": "attribute",
                "field": "attribute_id"
            },
            2: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_description",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "description",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "tag",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "meta_title",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "meta_description",
                "type": "varchar(255)",
                "not_null": true
            },
            7: {
                "name": "meta_keyword",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "index": {
            0: {
                "name": "name",
                "key": {
                    0: "name"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_discount",
        "field": {
            0: {
                "name": "product_discount_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "quantity",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            4: {
                "name": "priority",
                "type": "Number",
                "not_null": true,
                "default": "1"
            },
            5: {
                "name": "price",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            6: {
                "name": "date_start",
                "type": "date",
                "not_null": true
            },
            7: {
                "name": "date_end",
                "type": "date",
                "not_null": true
            }
        },
        "primary": {
            0: "product_discount_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            }
        },
        "index": {
            0: {
                "name": "product_id",
                "key": {
                    0: "product_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_filter",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "filter_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id",
            1: "filter_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "filter_id",
                "table": "filter",
                "field": "filter_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_image",
        "field": {
            0: {
                "name": "product_image_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true,
                "default": "0"
            }
        },
        "primary": {
            0: "product_image_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            }
        },
        "index": {
            0: {
                "name": "product_id",
                "key": {
                    0: "product_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_option",
        "field": {
            0: {
                "name": "product_option_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "option_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "value",
                "type": "text",
                "not_null": true
            },
            4: {
                "name": "required",
                "type": "tinyint(1)",
                "not_null": true
            }
        },
        "primary": {
            0: "product_option_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "option_id",
                "table": "option",
                "field": "option_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_option_value",
        "field": {
            0: {
                "name": "product_option_value_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "product_option_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "option_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "option_value_id",
                "type": "Number",
                "not_null": true
            },
            5: {
                "name": "quantity",
                "type": "Number",
                "not_null": true
            },
            6: {
                "name": "subtract",
                "type": "tinyint(1)",
                "not_null": true
            },
            7: {
                "name": "price",
                "type": "decimal(15,4)",
                "not_null": true
            },
            8: {
                "name": "price_prefix",
                "type": "varchar(1)",
                "not_null": true
            },
            9: {
                "name": "points",
                "type": "Number",
                "not_null": true
            },
            10: {
                "name": "points_prefix",
                "type": "varchar(1)",
                "not_null": true
            },
            11: {
                "name": "weight",
                "type": "decimal(15,8)",
                "not_null": true
            },
            12: {
                "name": "weight_prefix",
                "type": "varchar(1)",
                "not_null": true
            }
        },
        "primary": {
            0: "product_option_value_id"
        },
        "foreign": {
            0: {
                "key": "product_option_id",
                "table": "product_option",
                "field": "product_option_id"
            },
            1: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            2: {
                "key": "option_id",
                "table": "option",
                "field": "option_id"
            },
            3: {
                "key": "option_value_id",
                "table": "option_value",
                "field": "option_value_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_subscription",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "subscription_plan_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "trial_price",
                "type": "decimal(10,4)",
                "not_null": true
            },
            4: {
                "name": "price",
                "type": "decimal(10,4)",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id",
            1: "subscription_plan_id",
            2: "customer_group_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "subscription_plan_id",
                "table": "subscription_plan",
                "field": "subscription_plan_id"
            },
            2: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_related",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "related_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id",
            1: "related_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "related_id",
                "table": "product",
                "field": "product_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_report",
        "field": {
            0: {
                "name": "product_report_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "default": 0
            },
            3: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            4: {
                "name": "country",
                "type": "varchar(2)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "product_report_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_reward",
        "field": {
            0: {
                "name": "product_reward_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "product_id",
                "type": "Number",
                "not_null": true,
                "default": 0
            },
            2: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            3: {
                "name": "points",
                "type": "Number",
                "not_null": true,
                "default": "0"
            }
        },
        "primary": {
            0: "product_reward_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_special",
        "field": {
            0: {
                "name": "product_special_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "priority",
                "type": "Number",
                "not_null": true,
                "default": "1"
            },
            4: {
                "name": "price",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            5: {
                "name": "date_start",
                "type": "date",
                "not_null": true
            },
            6: {
                "name": "date_end",
                "type": "date",
                "not_null": true
            }
        },
        "primary": {
            0: "product_special_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            }
        },
        "index": {
            0: {
                "name": "product_id",
                "key": {
                    0: "product_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_to_category",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "category_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id",
            1: "category_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "category_id",
                "table": "category",
                "field": "category_id"
            }
        },
        "index": {
            0: {
                "name": "category_id",
                "key": {
                    0: "category_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_to_download",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "download_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id",
            1: "download_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "download_id",
                "table": "download",
                "field": "download_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_to_layout",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "layout_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            2: {
                "key": "layout_id",
                "table": "layout",
                "field": "layout_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_to_store",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            }
        },
        "primary": {
            0: "product_id",
            1: "store_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "product_viewed",
        "field": {
            0: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "viewed",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "product_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "return",
        "field": {
            0: {
                "name": "return_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "firstname",
                "type": "varchar(32)",
                "not_null": true
            },
            5: {
                "name": "lastname",
                "type": "varchar(32)",
                "not_null": true
            },
            6: {
                "name": "email",
                "type": "varchar(96)",
                "not_null": true
            },
            7: {
                "name": "telephone",
                "type": "varchar(32)",
                "not_null": true
            },
            8: {
                "name": "product",
                "type": "varchar(255)",
                "not_null": true
            },
            9: {
                "name": "model",
                "type": "varchar(64)",
                "not_null": true
            },
            10: {
                "name": "quantity",
                "type": "Number",
                "not_null": true
            },
            11: {
                "name": "opened",
                "type": "tinyint(1)",
                "not_null": true
            },
            12: {
                "name": "return_reason_id",
                "type": "Number",
                "not_null": true
            },
            13: {
                "name": "return_action_id",
                "type": "Number",
                "not_null": true
            },
            14: {
                "name": "return_status_id",
                "type": "Number",
                "not_null": true
            },
            15: {
                "name": "comment",
                "type": "text",
                "not_null": true
            },
            16: {
                "name": "date_ordered",
                "type": "date",
                "not_null": true
            },
            17: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            18: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "return_id"
        },
        "foreign": {
            0: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            },
            1: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            2: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            3: {
                "key": "return_reason_id",
                "table": "return_reason",
                "field": "return_reason_id"
            },
            4: {
                "key": "return_action_id",
                "table": "return_action",
                "field": "return_action_id"
            },
            5: {
                "key": "return_status_id",
                "table": "return_status",
                "field": "return_status_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "return_action",
        "field": {
            0: {
                "name": "return_action_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            }
        },
        "primary": {
            0: "return_action_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "return_history",
        "field": {
            0: {
                "name": "return_history_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "return_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "return_status_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "notify",
                "type": "tinyint(1)",
                "not_null": true
            },
            4: {
                "name": "comment",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "return_history_id"
        },
        "foreign": {
            0: {
                "key": "return_id",
                "table": "return",
                "field": "return_id"
            },
            1: {
                "key": "return_status_id",
                "table": "return_status",
                "field": "return_status_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "return_reason",
        "field": {
            0: {
                "name": "return_reason_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            }
        },
        "primary": {
            0: "return_reason_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "return_status",
        "field": {
            0: {
                "name": "return_status_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            }
        },
        "primary": {
            0: "return_status_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "review",
        "field": {
            0: {
                "name": "review_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "author",
                "type": "varchar(64)",
                "not_null": true
            },
            4: {
                "name": "text",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "rating",
                "type": "Number",
                "not_null": true
            },
            6: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "0"
            },
            7: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            8: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "review_id"
        },
        "foreign": {
            0: {
                "key": "product_id",
                "table": "product",
                "field": "product_id"
            },
            1: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            }
        },
        "index": {
            0: {
                "name": "product_id",
                "key": {
                    0: "product_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "startup",
        "field": {
            0: {
                "name": "startup_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "code",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "action",
                "type": "text",
                "not_null": true
            },
            3: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            4: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "startup_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "statistics",
        "field": {
            0: {
                "name": "statistics_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "code",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "value",
                "type": "decimal(15,4)",
                "not_null": true
            }
        },
        "primary": {
            0: "statistics_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "session",
        "field": {
            0: {
                "name": "session_id",
                "type": "varchar(32)",
                "not_null": true
            },
            1: {
                "name": "data",
                "type": "text",
                "not_null": true
            },
            2: {
                "name": "expire",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "session_id"
        },
        "index": {
            0: {
                "name": "expire",
                "key": {
                    0: "expire"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "setting",
        "field": {
            0: {
                "name": "setting_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "code",
                "type": "varchar(128)",
                "not_null": true
            },
            3: {
                "name": "key",
                "type": "varchar(128)",
                "not_null": true
            },
            4: {
                "name": "value",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "serialized",
                "type": "tinyint(1)",
                "not_null": true,
                "default": 0
            }
        },
        "primary": {
            0: "setting_id"
        },
        "foreign": {
            0: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "stock_status",
        "field": {
            0: {
                "name": "stock_status_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            }
        },
        "primary": {
            0: "stock_status_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "store",
        "field": {
            0: {
                "name": "store_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "url",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "store_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "subscription",
        "field": {
            0: {
                "name": "subscription_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "order_product_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "customer_id",
                "type": "Number",
                "not_null": true
            },
            5: {
                "name": "payment_address_id",
                "type": "Number",
                "not_null": true
            },
            6: {
                "name": "payment_method",
                "type": "text",
                "not_null": true
            },
            7: {
                "name": "shipping_address_id",
                "type": "Number",
                "not_null": true
            },
            8: {
                "name": "shipping_method",
                "type": "text",
                "not_null": true
            },
            9: {
                "name": "product_id",
                "type": "Number",
                "not_null": true
            },
            10: {
                "name": "quantity",
                "type": "Number",
                "not_null": true
            },
            11: {
                "name": "subscription_plan_id",
                "type": "Number",
                "not_null": true
            },
            12: {
                "name": "trial_price",
                "type": "decimal(10,4)",
                "not_null": true
            },
            13: {
                "name": "trial_frequency",
                "type": "enum('day','week','semi_month','month','year')",
                "not_null": true
            },
            14: {
                "name": "trial_cycle",
                "type": "smallint(6)",
                "not_null": true
            },
            15: {
                "name": "trial_duration",
                "type": "smallint(6)",
                "not_null": true
            },
            16: {
                "name": "trial_remaining",
                "type": "smallint(6)",
                "not_null": true
            },
            17: {
                "name": "trial_status",
                "type": "tinyint(1)",
                "not_null": true
            },
            18: {
                "name": "price",
                "type": "decimal(10,4)",
                "not_null": true
            },
            19: {
                "name": "frequency",
                "type": "enum('day','week','semi_month','month','year')",
                "not_null": true
            },
            20: {
                "name": "cycle",
                "type": "smallint(6)",
                "not_null": true
            },
            21: {
                "name": "duration",
                "type": "smallint(6)",
                "not_null": true
            },
            22: {
                "name": "remaining",
                "type": "smallint(6)",
                "not_null": true
            },
            23: {
                "name": "date_next",
                "type": "datetime",
                "not_null": true
            },
            24: {
                "name": "comment",
                "type": "text",
                "not_null": true
            },
            25: {
                "name": "subscription_status_id",
                "type": "Number",
                "not_null": true
            },
            26: {
                "name": "affiliate_id",
                "type": "Number",
                "not_null": true
            },
            27: {
                "name": "marketing_id",
                "type": "Number",
                "not_null": true
            },
            28: {
                "name": "tracking",
                "type": "varchar(64)",
                "not_null": true
            },
            29: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            30: {
                "name": "currency_id",
                "type": "Number",
                "not_null": true
            },
            31: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            32: {
                "name": "forwarded_ip",
                "type": "varchar(40)",
                "not_null": true
            },
            33: {
                "name": "user_agent",
                "type": "varchar(255)",
                "not_null": true
            },
            34: {
                "name": "accept_language",
                "type": "varchar(255)",
                "not_null": true
            },
            35: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            36: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "subscription_id"
        },
        "foreign": {
            0: {
                "key": "customer_id",
                "table": "customer",
                "field": "customer_id"
            },
            1: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            },
            2: {
                "key": "order_product_id",
                "table": "order_product",
                "field": "order_product_id"
            },
            3: {
                "key": "subscription_plan_id",
                "table": "subscription_plan",
                "field": "subscription_plan_id"
            },
            4: {
                "key": "subscription_status_id",
                "table": "subscription_status",
                "field": "subscription_status_id"
            }
        },
        "index": {
            0: {
                "name": "order_id",
                "key": {
                    0: "order_id"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "subscription_history",
        "field": {
            0: {
                "name": "subscription_history_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "subscription_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "subscription_status_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "notify",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "0"
            },
            4: {
                "name": "comment",
                "type": "text",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "subscription_history_id"
        },
        "foreign": {
            0: {
                "key": "subscription_id",
                "table": "subscription",
                "field": "subscription_id"
            },
            1: {
                "key": "subscription_status_id",
                "table": "subscription_status",
                "field": "subscription_status_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "subscription_plan",
        "field": {
            0: {
                "name": "subscription_plan_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "trial_frequency",
                "type": "enum('day','week','semi_month','month','year')",
                "not_null": true
            },
            2: {
                "name": "trial_duration",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "trial_cycle",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "trial_status",
                "type": "tinyint(4)",
                "not_null": true
            },
            5: {
                "name": "frequency",
                "type": "enum('day','week','semi_month','month','year')",
                "not_null": true
            },
            6: {
                "name": "duration",
                "type": "Number",
                "not_null": true
            },
            7: {
                "name": "cycle",
                "type": "Number",
                "not_null": true
            },
            8: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            9: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "subscription_plan_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "subscription_plan_description",
        "field": {
            0: {
                "name": "subscription_plan_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "subscription_plan_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "subscription_status",
        "field": {
            0: {
                "name": "subscription_status_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            }
        },
        "primary": {
            0: "subscription_status_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "tax_class",
        "field": {
            0: {
                "name": "tax_class_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "title",
                "type": "varchar(32)",
                "not_null": true
            },
            2: {
                "name": "description",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            4: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "tax_class_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "tax_rate",
        "field": {
            0: {
                "name": "tax_rate_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "geo_zone_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            2: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            },
            3: {
                "name": "rate",
                "type": "decimal(15,4)",
                "not_null": true,
                "default": "0.0000"
            },
            4: {
                "name": "type",
                "type": "char(1)",
                "not_null": true
            },
            5: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            6: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "tax_rate_id"
        },
        "foreign": {
            0: {
                "key": "geo_zone_id",
                "table": "geo_zone",
                "field": "geo_zone_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "tax_rate_to_customer_group",
        "field": {
            0: {
                "name": "tax_rate_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "customer_group_id",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "tax_rate_id",
            1: "customer_group_id"
        },
        "foreign": {
            0: {
                "key": "tax_rate_id",
                "table": "tax_rate",
                "field": "tax_rate_id"
            },
            1: {
                "key": "customer_group_id",
                "table": "customer_group",
                "field": "customer_group_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "tax_rule",
        "field": {
            0: {
                "name": "tax_rule_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "tax_class_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "tax_rate_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "based",
                "type": "varchar(10)",
                "not_null": true
            },
            4: {
                "name": "priority",
                "type": "Number",
                "not_null": true,
                "default": "1"
            }
        },
        "primary": {
            0: "tax_rule_id"
        },
        "foreign": {
            0: {
                "key": "tax_class_id",
                "table": "tax_class",
                "field": "tax_class_id"
            },
            1: {
                "key": "tax_rate_id",
                "table": "tax_rate",
                "field": "tax_rate_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "theme",
        "field": {
            0: {
                "name": "theme_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "route",
                "type": "varchar(64)",
                "not_null": true
            },
            3: {
                "name": "code",
                "type": "mediumtext",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "theme_id"
        },
        "foreign": {
            0: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "translation",
        "field": {
            0: {
                "name": "translation_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "route",
                "type": "varchar(64)",
                "not_null": true
            },
            4: {
                "name": "key",
                "type": "varchar(64)",
                "not_null": true
            },
            5: {
                "name": "value",
                "type": "text",
                "not_null": true
            },
            6: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "translation_id"
        },
        "foreign": {
            0: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "upload",
        "field": {
            0: {
                "name": "upload_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(255)",
                "not_null": true
            },
            2: {
                "name": "filename",
                "type": "varchar(255)",
                "not_null": true
            },
            3: {
                "name": "code",
                "type": "varchar(255)",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "upload_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "seo_url",
        "field": {
            0: {
                "name": "seo_url_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "store_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "key",
                "type": "varchar(64)",
                "not_null": true
            },
            4: {
                "name": "value",
                "type": "varchar(255)",
                "not_null": true
            },
            5: {
                "name": "keyword",
                "type": "varchar(768)",
                "not_null": true
            },
            6: {
                "name": "sort_order",
                "type": "Number",
                "not_null": true
            }
        },
        "primary": {
            0: "seo_url_id"
        },
        "foreign": {
            0: {
                "key": "store_id",
                "table": "store",
                "field": "store_id"
            },
            1: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "index": {
            0: {
                "name": "keyword",
                "key": {
                    0: "keyword"
                }
            },
            1: {
                "name": "query",
                "key": {
                    0: "key",
                    1: "value"
                }
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "user",
        "field": {
            0: {
                "name": "user_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "user_group_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "username",
                "type": "varchar(20)",
                "not_null": true
            },
            3: {
                "name": "password",
                "type": "varchar(255)",
                "not_null": true
            },
            4: {
                "name": "firstname",
                "type": "varchar(32)",
                "not_null": true
            },
            5: {
                "name": "lastname",
                "type": "varchar(32)",
                "not_null": true
            },
            6: {
                "name": "email",
                "type": "varchar(96)",
                "not_null": true
            },
            7: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true,
                "default": ""
            },
            8: {
                "name": "code",
                "type": "varchar(40)",
                "not_null": true,
                "default": ""
            },
            9: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true,
                "default": ""
            },
            10: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            11: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "user_id"
        },
        "foreign": {
            0: {
                "key": "user_group_id",
                "table": "user_group",
                "field": "user_group_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "user_authorize",
        "field": {
            0: {
                "name": "user_authorize_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "user_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "token",
                "type": "varchar(96)",
                "not_null": true
            },
            3: {
                "name": "total",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            5: {
                "name": "user_agent",
                "type": "varchar(255)",
                "not_null": true
            },
            6: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            7: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "user_authorize_id"
        },
        "foreign": {
            0: {
                "key": "user_id",
                "table": "user",
                "field": "user_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "user_group",
        "field": {
            0: {
                "name": "user_group_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "name",
                "type": "varchar(64)",
                "not_null": true
            },
            2: {
                "name": "permission",
                "type": "text",
                "not_null": true
            }
        },
        "primary": {
            0: "user_group_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "user_login",
        "field": {
            0: {
                "name": "user_login_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "user_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "ip",
                "type": "varchar(40)",
                "not_null": true
            },
            3: {
                "name": "user_agent",
                "type": "varchar(255)",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "user_login_id"
        },
        "foreign": {
            0: {
                "key": "user_id",
                "table": "user",
                "field": "user_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "voucher",
        "field": {
            0: {
                "name": "voucher_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "code",
                "type": "varchar(10)",
                "not_null": true
            },
            3: {
                "name": "from_name",
                "type": "varchar(64)",
                "not_null": true
            },
            4: {
                "name": "from_email",
                "type": "varchar(96)",
                "not_null": true
            },
            5: {
                "name": "to_name",
                "type": "varchar(64)",
                "not_null": true
            },
            6: {
                "name": "to_email",
                "type": "varchar(96)",
                "not_null": true
            },
            7: {
                "name": "voucher_theme_id",
                "type": "Number",
                "not_null": true
            },
            8: {
                "name": "message",
                "type": "text",
                "not_null": true
            },
            9: {
                "name": "amount",
                "type": "decimal(15,4)",
                "not_null": true
            },
            10: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true
            },
            11: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "voucher_id"
        },
        "foreign": {
            0: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "voucher_history",
        "field": {
            0: {
                "name": "voucher_history_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "voucher_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "order_id",
                "type": "Number",
                "not_null": true
            },
            3: {
                "name": "amount",
                "type": "decimal(15,4)",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "voucher_history_id"
        },
        "foreign": {
            0: {
                "key": "voucher_id",
                "table": "voucher",
                "field": "voucher_id"
            },
            1: {
                "key": "order_id",
                "table": "order",
                "field": "order_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "voucher_theme",
        "field": {
            0: {
                "name": "voucher_theme_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "image",
                "type": "varchar(255)",
                "not_null": true
            }
        },
        "primary": {
            0: "voucher_theme_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "voucher_theme_description",
        "field": {
            0: {
                "name": "voucher_theme_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(32)",
                "not_null": true
            }
        },
        "primary": {
            0: "voucher_theme_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "weight_class",
        "field": {
            0: {
                "name": "weight_class_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "value",
                "type": "decimal(15,8)",
                "not_null": true,
                "default": "0.00000000"
            }
        },
        "primary": {
            0: "weight_class_id"
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "weight_class_description",
        "field": {
            0: {
                "name": "weight_class_id",
                "type": "Number",
                "not_null": true
            },
            1: {
                "name": "language_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "title",
                "type": "varchar(32)",
                "not_null": true
            },
            3: {
                "name": "unit",
                "type": "varchar(4)",
                "not_null": true
            }
        },
        "primary": {
            0: "weight_class_id",
            1: "language_id"
        },
        "foreign": {
            0: {
                "key": "language_id",
                "table": "language",
                "field": "language_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "zone",
        "field": {
            0: {
                "name": "zone_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "country_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "name",
                "type": "varchar(128)",
                "not_null": true
            },
            3: {
                "name": "code",
                "type": "varchar(32)",
                "not_null": true
            },
            4: {
                "name": "status",
                "type": "tinyint(1)",
                "not_null": true,
                "default": "1"
            }
        },
        "primary": {
            0: "zone_id"
        },
        "foreign": {
            0: {
                "key": "country_id",
                "table": "country",
                "field": "country_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    schemas.push( {
        "name": "zone_to_geo_zone",
        "field": {
            0: {
                "name": "zone_to_geo_zone_id",
                "type": "Number",
                "not_null": true,
                "auto_increment": true
            },
            1: {
                "name": "country_id",
                "type": "Number",
                "not_null": true
            },
            2: {
                "name": "zone_id",
                "type": "Number",
                "not_null": true,
                "default": "0"
            },
            3: {
                "name": "geo_zone_id",
                "type": "Number",
                "not_null": true
            },
            4: {
                "name": "date_added",
                "type": "datetime",
                "not_null": true
            },
            5: {
                "name": "date_modified",
                "type": "datetime",
                "not_null": true
            }
        },
        "primary": {
            0: "zone_to_geo_zone_id"
        },
        "foreign": {
            0: {
                "key": "country_id",
                "table": "country",
                "field": "country_id"
            },
            1: {
                "key": "zone_id",
                "table": "zone",
                "field": "zone_id"
            },
            2: {
                "key": "geo_zone_id",
                "table": "geo_zone",
                "field": "geo_zone_id"
            }
        },
        "engine": "InnoDB",
        "charset": "utf8mb4",
        "collate": "utf8mb4_general_ci"
    });
    return tables;
}

                        
