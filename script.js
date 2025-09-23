
document.addEventListener("DOMContentLoaded", initApp);

const USER_URL = "https://jsonplaceholder.typicode.com/users";

async function initApp(){
    document.querySelector("#userForm").addEventListener("submit", () => handleSubmitClick(event));
    console.log("Hello World")
    document.querySelector("#messages").textContent = "JS Connected";
    users = await fetchUsers();
    console.log(users)
    renderUsers(users);
}


async function fetchUsers(){
    const resp = await fetch(USER_URL);
    if(!resp.ok){
        console.log("Error: " + resp.status);
        document.querySelector("#messages").textContent = "FEJL!";
        document.querySelector("#messages").classList.toggle("error");
    }
    return await resp.json();
}

function renderUsers(users){
    users.forEach(user => {
        renderUser(user)
    });
}

function renderUser(user){
    const row = document.createElement("tr");

    //Add id to the table
    row.appendChild(renderUserElement(user.id));

    //Add name to table
    row.appendChild(renderUserElement(user.name));

    //Add email to table
    row.appendChild(renderUserElement(user.email));

    //Add city to table
    row.appendChild(renderUserElement(user.address.city));

    //Add Edit Button
    const editButtonCell = document.createElement("td");
    editButtonCell.classList.add("userControlButtonCell");
    const editButton = document.createElement("button");
        //We need the user ID in the id of the button
    const userID = "user" + user.id + "EditButton";
    editButton.id = "edit" + userID;                    //I set the id of the button so I can find it a bit later
    editButton.textContent = "Edit User"
    editButton.classList.add("userControlButton");
    editButtonCell.appendChild(editButton);
    row.appendChild(editButtonCell);

    //Add Delete Button
    const deleteButtonCell = document.createElement("td");
    deleteButtonCell.classList.add("userControlButtonCell");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete User";
    deleteButton.id = "delete" + userID;
    deleteButton.style.backgroundColor = "lightcoral";
    deleteButton.classList.add("userControlButton");
    deleteButtonCell.appendChild(deleteButton);
    row.appendChild(deleteButtonCell);

    //Both buttons will be inside the same column thanks to the COLSPAN ="2" in the html

    document.querySelector("#usersTable").appendChild(row);
    document.querySelector(`#edit${userID}`).addEventListener("click", () => handleEditClick(user));
    document.querySelector(`#delete${userID}`).addEventListener("click", () => handleDeleteClick(user));
}

function handleDeleteClick(user){
    console.log("You want to delete user with ID: " + user.id);
    deleteUser(user);
}

function handleEditClick(user){
    console.log("clicked " + user.id);
    const form = document.querySelector("#userForm");
    if(!form.classList.contains("edit")){
    form.classList.add("edit");
    }
    form.firstElementChild.textContent = "Edit User: " + user.name;

    //Set the values in the form to the current values of the table entries.
    const nameField = form.firstElementChild.nextElementSibling;
    const emailField = form.firstElementChild.nextElementSibling.nextElementSibling;
    const cityField = form.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling;

    nameField.value = user.name;
    emailField.value = user.email;
    cityField.value = user.address.city;

    //Set the id to check when pressing submit
    const idField = document.querySelector("#idField");
    idField.value = user.id;

    console.log(document.querySelector("#idField").value);
}

function renderUserElement(element){
    const returnCell = document.createElement("td");
    returnCell.innerHTML = element;
    return returnCell;
}

async function handleSubmitClick(event){
    console.log("Click! - by Adam Sandler");

    //Prevent default post behavior
    event.preventDefault();

    //Fetch the form data from the target (The form)
    const target = event.target;
    const formData = new FormData(target);
    
    //Create a user with the form data object. if there is an ID, create a user with an id field as well.
    

    //If the hidden ID field contains an ID, perform an update of the user, if not, create a new user.
    if(!document.querySelector("#idField").value == false){
        //Use the updateUser to update the new user
        console.log("There is an id in the field!")
        const user = {
            id: formData.get('idField'),
            name: formData.get('nameInput'), 
            email: formData.get('emailInput'),
            address: {
                city: formData.get('cityInput')
            }
        }

        updateUser(user);


        //Reset the edit styling on the form
        document.querySelector("#userForm").classList.remove("edit");
        document.querySelector("#userForm").firstElementChild.textContent="Create User";
    }
    else{
        //Use the renderUser function to render the user at the end of the list.
        const user = {
            name: formData.get('nameInput'), 
            email: formData.get('emailInput'),
            address: {
                city: formData.get('cityInput')
            }
        }
        renderUser(await createUser(user))
    }

    
    //Reset the form
    target.reset();
    
}

async function createUser(user){
    //Use the fetch command to send the POST request (Super unintuitive btw). Add an object containing the method, headers and body. 
    const resp = await fetch(USER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })

    //Set up a message content variable to provide userfeedback. (DESIGN DIALOGUE TO YIELD CLOSURE) - Schneidermann
    let messageContent = "";

    //Depending on the result, set message
    if (!resp.ok){
        console.log("Error!");
        console.log(resp.status);
        messageContent = "Failed to create user";
    }else{
        messageContent = "User Created succesfully";
    }

    //Update message
    document.querySelector("#messages").textContent = messageContent;

    //Send the json user back
    return await resp.json();
}

async function updateUser(user){
    const resp = await fetch(USER_URL + "/" + user.id, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })

    console.log(resp.status);

    //Set up a message content variable to provide userfeedback. (DESIGN DIALOGUE TO YIELD CLOSURE) - Schneidermann
    let messageContent = "";

    //Depending on the result, set message
    if (!resp.ok){
        console.log("Error!");
        console.log(resp.status);
        messageContent = "Failed to update user";
    }else{
        messageContent = "User Updated succesfully";

        //BECAUSE THE DATABASE DOES NOT PERSIST CHANGES, WE FAKE THE EFFECT HERE.

        //Update the user info
        //First find the correct row
        const table = document.querySelector("#usersTable");
        const rows = table.querySelectorAll("tr");
        let desiredRow;
        rows.forEach(row => {
            if(row.firstElementChild.textContent == user.id){
                console.log(row);
                desiredRow = row;
            }
        })

        //Then set the individual values to be the correct value
        const nameField = desiredRow.firstElementChild.nextElementSibling;
        const emailField = nameField.nextElementSibling;
        const cityField = emailField.nextElementSibling;

        nameField.textContent = user.name;
        emailField.textContent = user.email;
        cityField.textContent = user.address.city;
        
    }

    //Update message
    document.querySelector("#messages").textContent = messageContent;
    document.querySelector("#idField").value = null;


    //We do not send the user back in this case. We would use the fetchUsersMethod to render the list anew to see the new updates in the correct place.
    //Instead we update the content manually in the else case of the above if statement


}


async function deleteUser(user) {
    const resp = await fetch(USER_URL + "/" + user.id, {
        method: "DELETE"
    })

    console.log(resp.status);

    //Then we fake the removal if the response code is ok
    if(resp.ok){
        const table = document.querySelector("#usersTable");
        const rows = table.querySelectorAll("tr");
        rows.forEach(row => {
            if(row.firstElementChild.textContent == user.id){
                console.log(row);
                row.remove();
            }
        })

        document.querySelector("#messages").textContent = "User Deleted Succesfully";
    }
}
