import { UserData, getUserData } from "@decentraland/Identity"

export class ServerHandler{
    firebaseServerURL: string
    userData: Promise<UserData>
    adminList: Promise<string[]>
    guestList: Promise<string[]>
    objectsConditions: { [name: string]: any }

    constructor(url: string) {
        this.firebaseServerURL = url 
        this.userData = getUserData()
        this.adminList = this.getAdminList()
        this.guestList = this.getGuestList()
        this.objectsConditions = {} 
    }
    
    private async getWalletAddressList(title:string) {
        try {
            let response = await fetch(this.firebaseServerURL + title)
            let json = await response.json()
            return json[0]
        } catch (error) {
            log("error fetching " + title + "from server: " + error)
        }
    }
    
    private async getAdminList() {
        return this.getWalletAddressList("get-admin-list")
    }
    
    private async getGuestList() {
        return this.getWalletAddressList("get-guest-list")
    }

    public async isVIP() {
        return await this.isAdmin() || await this.isGuest()
    }
    
    public async isAdmin() {
        let key = (await this.userData).publicKey;
        return this.isAddressInlist(key, await this.adminList)
    }
    
    public async isGuest() {
        let key = (await this.userData).publicKey;
        return this.isAddressInlist(key, await this.guestList)
    }
    
    private async isAddressInlist(key:string, list: any) {
        for (let i = 0; i < list.length; i++) {
            if (list[i] != null && list[i].toLowerCase() == key || list[i] == key) {
                return true
            }
        }
        return false
    }

    private async fetchCondition(id:string) {
        try {
            let response = await fetch(this.firebaseServerURL + "get-object-condition", {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ id: id }),
            })
            return (await response.json())[0]
        } catch (error) {
            log("error fetch object conditions from server: " + error)
        }
    }
    
    public async changeObjectCondition(id:string, condition:any) {
        try {
            let response = await fetch(this.firebaseServerURL + "change-object-condition", {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ id: id, condition: condition }),
            })
            this.objectsConditions[id] = condition
    
            log("object condition changed to server")

            return response;
        } catch (error) {
            log("error change object condition to server: " + error)
        }
    }
    
    public async getObjectCondition(id:string) {
        try {
            if (this.objectsConditions[id] === undefined) {
                this.objectsConditions[id] = await this.fetchCondition(id)
            }
    
            return this.objectsConditions[id]
        } catch (error) {
            log("error get object condition from server: " + error)
        }
    }
    
    public async addPotentialBuyer(url:string) {
        try {
            let address = (await this.userData).publicKey
            let name = (await this.userData).displayName
    
            let response = await fetch(this.firebaseServerURL + "add-potential-buyer", {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({ walletAddress: address, name: name, url: url }),
            })
    
            log("potential buyer added to server");
            return response;
        } catch (error) {
            log("error add potential buyer to server: " + error);
        }
    }
}