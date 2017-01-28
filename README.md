# **React Movie Trailer Website : Server**

![enter image description here](https://s28.postimg.org/5zf0pzge5/DAMN.png)

## **Execution**
    git clone

#### Server
    (Install and run MongoDB Community Edition)
    npm install
    node ./server.js
    -> Go to http://localhost:8080/api/server

## **Project Description**

#### The Website is composed of two parts:
###### The first part is public and therefore accessible to all. It allows you to browse through movies and to see their information. As a public user you can :

    Access the home page.
    Access the login and signup pages.
    Access all 12 category pages.
    Acces a movie's information.
    Acess the "all movies" pages, in which you can:
        Browse through all movies depending on various filters:
            Title, Producer, Release Date,
            Cast, Upload Date, Uploader

###### The second part is for signed-in users. It allows to administrate movie cards. In addition to a public user's rights, as a signed-in user you can :
    Add a movie.
    Edit a movie's information.
    Delete a movie.

#### Additional Project Information and Limits

There is some missing feedbacks for the users, buttons will redirect to other pages without telling user if action worked or not. **Use the built-in browser console to get more info while going through the webapp.**

Logging-in and signing-up forms are linked to the back-end server.

A public user will have the same interface as a signed-in user.
If a user tries to acces movie CRUD, the webapp will check if he is signed-in (checking for token in local storage):
If he is not, he will stay on current page.
If he is, he will be redirected to the chosen functionality.

Movie CRUDs have been created in the front-end and back-end but POST methods haven't been established between the server and the webapp. Submit buttons are fake but will still redirect you to the appropriate page once you click.

User's inputs checking (validators) has only been created on the front-end side.
