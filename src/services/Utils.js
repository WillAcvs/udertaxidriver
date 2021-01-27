class Utils {

    static parseDate(date){
        console.log(date);
        const currentDate = new Date(date);
        return `El ${currentDate.getDate()} del ${currentDate.getMonth() + 1} de ${currentDate.getFullYear()}`;
    }
}

export {
    Utils
}