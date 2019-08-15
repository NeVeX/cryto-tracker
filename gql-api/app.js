const Express = require("express");
const Couchbase = require("couchbase");
const ExpressGraphQL = require("express-graphql");
const BuildSchema = require("graphql").buildSchema;
const UUID = require("uuid");

var schema = BuildSchema(`
    type Query {
        account(id: String!): Account,
        accounts: [Account],
    }
    type Account {
        id: String,
        firstname: String,
        lastname: String,
    }
    type Mutation {
        createAccount(firstname: String!, lastname: String!): Account
    }
`);

var resolvers = {
  createAccount: (data) => {
    var id = UUID.v4();
    data.type = "account";
    return new Promise((resolve, reject) => {
      bucket.include_docs = true;
      bucket.insert(id, data, options= { include_docs: true }, (error, result) => {
        if(error) {
          return reject(error);
        }
        console.log(result.value);
        resolve(result.cas);
      });
    });
  },
  account: (data) => {
    var id = data.id;
    return new Promise((resolve, reject) => {
      bucket.get(id, (error, result) => {
        if(error) {
          return reject(error);
        }
        result.value.id = id;
        resolve(result.value);
      });
    });
  },
  accounts: () => {
    return new Promise((resolve, reject) => {
      var statement = "SELECT META(account).id, account.* FROM `"+bucket.name+"` AS account WHERE account.type = 'account' LIMIT 100";
      var query = Couchbase.N1qlQuery.fromString(statement);
      bucket.query(query, (error, result) => {
        if(error) {
          return reject(error);
        }
        resolve(result);
      });
    });
  }
};

var app = Express();

app.use("/graphql", ExpressGraphQL({
  schema: schema,
  rootValue: resolvers,
  graphiql: true
}));

app.listen(3000, () => {
  console.log("Listening at :3000");
});


var cluster = new Couchbase.Cluster("couchbase://localhost");
console.log("user: "+process.env.COUCHBASE_USER);
console.log("pass: "+process.env.COUCHBASE_PASSWORD);
// cluster.authenticate(process.env.COUCHBASE_USER, process.env.COUCHBASE_PASSWORD); // This does not work???

var bucket = cluster.openBucket("crypto-tracker-bucket-1", null, (error, result) => {
  if ( error ) {
    console.log("error opening bucket "+error);
    throw error;
  } else {
    console.log("opened bucket");
  }
});

// var bucket = cluster.buckets().get("crypto-tracker-bucket-1");
// console.log("got bucket " + bucket);
