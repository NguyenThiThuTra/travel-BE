
code: "
"


-----> 
7 5 cate1  ->
3 cate2 
 API :  {_idcate:1,quantity:5}   {_idcate:2 , quantity: 3}
 [1,2,3,4,5]   [1,2,3]  ->  updateMany()

 API :  {_idcate:1,quantity:5}   {_idcate:2 , quantity: 3}

 ->.nao  [idcate:1, idcate2]  
 ....for (idcate:1, idcate){

      Array ROom =  find( {idcate1,time} ).limit(,quantity:5);
 Room.deleteMany([rooms.map(room=>room.id)])
 }
 mongoose  




# Getting Started Front-end
### `npm install`
Downloads a package and it's dependencies.\
## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
### `yarn build`

Builds the app for production to the `build` folder.\
