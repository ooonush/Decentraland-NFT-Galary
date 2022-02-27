import { getUserData } from "@decentraland/Identity"

let firebaseServerURL = "https://us-central1-nft-gallery-339414.cloudfunctions.net/app/";
let userData = fetchUserData();
let adminList = getAdminList();
let guestList = getGuestList();
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

async function getGuestList() {
    return getWalletAddressList("get-guest-list")
}

export async function isVIP() {
    return await isAdmin() || await isGuest();
}

export async function isAdmin() {
    let address = (await userData).publicKey
    return (await adminList).includes(address);
}

export async function isGuest() {
    let address = (await userData).publicKey
    return (await guestList).includes(address);
}