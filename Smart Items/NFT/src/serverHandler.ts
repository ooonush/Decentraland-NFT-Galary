import { getUserData } from "@decentraland/Identity"

let firebaseServerURL = "https://us-central1-nft-gallery-339414.cloudfunctions.net/app/"
let userData = fetchUserData()

async function fetchUserData() {
    return await getUserData()
}

async function getWalletAddressList(title:string) {
    let response = await fetch(firebaseServerURL + title)
    let json = await response.json()
    log(json[0])
    return json[0];
}

export async function addPotentialBuyer() {
    let address = (await userData).publicKey;
    let name = (await userData).displayName;

    let response = await fetch(firebaseServerURL + "add-potential-buyer", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ walletAddress: address, name: name }),
    })
}

export async function getAdminList() {
    return getWalletAddressList("get-admin-list")
}

export async function getGuestList() {
    return getWalletAddressList("get-guest-list")
}