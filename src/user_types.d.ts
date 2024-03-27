type User ={
    /**
     * User id defined by the database 
     */
    id: number,
    /**
     * user's email as entered when created 
     */
    email: string,
    /**
     * user's firstname as entered when created 
     */
    first_name: string,
    /**
     * user's lastname as entered when created 
     */
    last_name:string,
    /**
     * user's password as entered when created 
     */
    password: string
     /**
     * user's token created when they are logged in  
     */
    auth_token: string
     /**
     * user's image file name 
     */
    image_filename: string




}