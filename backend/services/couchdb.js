import nano from "nano";

const couch = nano(process.env.COUCHDB_URL || "http://127.0.0.1:5984");

// make sure this DB exists in CouchDB UI
const db = couch.db.use(process.env.COUCHDB_NAME || "match_data");

export default db;