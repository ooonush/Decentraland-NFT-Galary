import { getUserData } from "@decentraland/Identity"

let firebaseServerURL = "https://us-central1-nft-gallery-339414.cloudfunctions.net/app/";
let userData = fetchUserData();
let adminList = getAdminList();

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

export async function isAdmin() {
    let address = (await userData).publicKey
    return (await adminList).includes(address);
}