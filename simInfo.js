const fetch = require('node-fetch');

async function fetchSimInfo(number) {
    try {
        const response = await fetch("https://simownership.com/wp-admin/admin-ajax.php", {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryS58Yd2P10B5eb819",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
                "cookie": "your-cookie-data-here",
                "Referer": "https://simownership.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": `------WebKitFormBoundaryS58Yd2P10B5eb819\r\nContent-Disposition: form-data; name="post_id"\r\n\r\n23\r\n------WebKitFormBoundaryS58Yd2P10B5eb819\r\nContent-Disposition: form-data; name="form_id"\r\n\r\n0e08cad\r\n------WebKitFormBoundaryS58Yd2P10B5eb819\r\nContent-Disposition: form-data; name="referer_title"\r\n\r\nSIM Ownership Search - Find SIM & CNIC Details Instantly\r\n------WebKitFormBoundaryS58Yd2P10B5eb819\r\nContent-Disposition: form-data; name="queried_id"\r\n\r\n23\r\n------WebKitFormBoundaryS58Yd2P10B5eb819\r\nContent-Disposition: form-data; name="form_fields[search]"\r\n\r\n${number}\r\n------WebKitFormBoundaryS58Yd2P10B5eb819\r\nContent-Disposition: form-data; name="action"\r\n\r\nelementor_pro_forms_send_form\r\n------WebKitFormBoundaryS58Yd2P10B5eb819\r\nContent-Disposition: form-data; name="referrer"\r\n\r\nhttps://simownership.com/\r\n------WebKitFormBoundaryS58Yd2P10B5eb819--\r\n`,
            "method": "POST"
        });

        const data = await response.json();
        if (data.success && data.data && data.data.data && data.data.data.results.length > 0) {
            const result = data.data.data.results[0];
            return `MOBILE: ${result.MOBILE}\nNAME: ${result.NAME}\nCNIC: ${result.CNIC}\nADDRESS: ${result.ADDRESS}\nNETWORK: ${result.NETWORK}`;
        } else {
            return "No details found for the given number.";
        }
    } catch (error) {
        console.error('Error fetching SIM info:', error);
        return "An error occurred while fetching SIM info.";
    }
}


module.exports = { fetchSimInfo };