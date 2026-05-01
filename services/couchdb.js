import nano from "nano";

const couch = nano("http://Elvis:1234@127.0.0.1:5984");

// make sure this DB exists in CouchDB UI
const db = couch.db.use("match_data");

export default db;