import { getUserData } from "@decentraland/Identity"

let firebaseServerURL = "https://us-central1-nft-gallery-339414.cloudfunctions.net/app/";
let userData = fetchUserData();
let adminList = getAdminList();

let objectsConditions: { [name: string]: any } = {};

async function fetchUserData() {
    return await getUserData()
}

async function getWalletAddressList(title:string) {
    try {
        let response = await fetch(firebaseServerURL + title)
        let json = await response.json()
        return json[0];
    } catch (error) {
        log("error fetching " + title + "from server: " + error)
    }
}

async function getAdminList() {
    return getWalletAddressList("get-admin-list")
}

async function fetchCondition(id:string) {
    try {
        let response = await fetch(firebaseServerURL + "get-object-condition", {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ id: id }),
        })
        return (await response.json())[0]
    } catch (error) {
        log("error fetch object conditions from server: " + error)
    }
}

export async function changeObjectCondition(id:string, condition:any) {
    try {
        let response = await fetch(firebaseServerURL + "change-object-condition", {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ id: id, condition: condition }),
        })
        objectsConditions[id] = condition;

        return response;
    } catch (error) {
        log("error change object condition to server: " + error);
    }
}

export async function getObjectCondition(id:string) {
    try {
        if (objectsConditions[id] === undefined) {
            objectsConditions[id] = await fetchCondition(id);
        }

        return objectsConditions[id];
    } catch (error) {
        log("error get object condition from server: " + error);
    }
}

export async function isAdmin() {
    let address = (await userData).publicKey
    return (await adminList).includes(address);
}