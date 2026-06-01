const fs = require('fs');

function fixFiles() {
    // ======== Login.jsx ========
    let login = fs.readFileSync('src/pages/Login.jsx', 'utf8');

    // 1. replace handleChange
    login = login.replace(
        /const handleChange = \(e\) => \{[\s\S]*?setFormData\(\(prev\) => \(\{[\s\S]*?\.\.\.prev,[\s\S]*?\[name\]: value[\s\S]*?\}\)\);[\s\S]*?\};/,
        `const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            const numericValue = value.replace(/\\D/g, '');
            if (numericValue.length > 10) return;
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };`
    );

    // 2. replace handleLogin validation
    login = login.replace(
        /if \(\!formData\.mobile \|\| \!formData\.pass\) \{[\s\S]*?toast\.error\("Mobile Number aur Password daalna zaroori hai!"\);[\s\S]*?return;[\s\S]*?\}/,
        `if (!formData.mobile || !formData.pass) {
            toast.error("Mobile Number aur Password daalna zaroori hai!");
            return;
        }

        if (formData.mobile.length !== 10) {
            toast.error("Mobile Number 10 digits ka hona chahiye!");
            return;
        }`
    );

    // 3. replace input
    login = login.replace(
        /<input[\s\S]*?name="mobile"[\s\S]*?onChange=\{handleChange\}[\s\S]*?className='bg-transparent border-none/g,
        `<input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength={10}
                            className='bg-transparent border-none`
    );

    fs.writeFileSync('src/pages/Login.jsx', login);

    // ======== Sign.jsx ========
    let sign = fs.readFileSync('src/pages/Sign.jsx', 'utf8');

    // 1. replace handleChange
    sign = sign.replace(
        /const handleChange = \(e\) => \{[\s\S]*?setFormData\(\(prev\) => \(\{[\s\S]*?\.\.\.prev,[\s\S]*?\[name\]: value[\s\S]*?\}\)\);[\s\S]*?\};/,
        `const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            const numericValue = value.replace(/\\D/g, '');
            if (numericValue.length > 10) return;
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
            return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };`
    );

    // 2. replace handleSignUp validation
    sign = sign.replace(
        /if \(\!formData\.mobile \|\| \!formData\.name \|\| \!formData\.pass\) \{[\s\S]*?toast\.error\("Mobile, Name aur Password daalna zaroori hai!"\);[\s\S]*?return;[\s\S]*?\}/,
        `if (!formData.mobile || !formData.name || !formData.pass) {
            toast.error("Mobile, Name aur Password daalna zaroori hai!");
            return;
        }

        if (formData.mobile.length !== 10) {
            toast.error("Mobile Number 10 digits ka hona chahiye!");
            return;
        }`
    );

    // 3. replace input
    sign = sign.replace(
        /<input[\s\S]*?name="mobile"[\s\S]*?onChange=\{handleChange\}[\s\S]*?className='bg-transparent border-none/g,
        `<input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength={10}
                            className='bg-transparent border-none`
    );

    fs.writeFileSync('src/pages/Sign.jsx', sign);
    console.log('Fixed');
}

fixFiles();
