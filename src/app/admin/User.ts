export interface User {
  userName : string;
  firstName : string;
  lastName : string;
  email : string;
  password : string;
  gender : string;
  contact : {
    address1 : string;
    address2 : string;
    city : string;
    state : string;
    zip : string;
    country : string;
  }
}