import bcrypt from "bcrypt";

const hash = async (password: string): Promise<string> => {
    // Todo: update this to encrypt the password
    password = bcrypt.hashSync(password,10);
    return password;
}

const compare = async (password: string, comp: string): Promise<boolean> => {
    // Todo: (suggested) update this to compare the encrypted passwords
    return bcrypt.compare(password,comp);
}

export {hash, compare}