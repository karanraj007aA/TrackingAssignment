import Realm from "realm";

const UserSchema = {
  name: "User",
  properties: {
    id: "string",
    username: "string",
    password: "string",
    checkInTime: 'string?', // Nullable, stores check-in time in ISO string format
    checkOutTime: 'string?',
  },
  primaryKey: "id",
};

const realm = new Realm({ schema: [UserSchema] });

export default realm;