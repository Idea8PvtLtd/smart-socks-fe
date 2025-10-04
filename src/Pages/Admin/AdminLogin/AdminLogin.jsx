import React, { useState } from 'react';
import AlertDemo from '../../../Components/Alert/AlertDemo';
import content from '../../../Jsons/Content/Content.json';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
    // Add state for email, password, and alertType
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alertType, setAlertType] = useState('');
    const navigate = useNavigate();

    // Add handleSubmit function for validation
    const handleSubmit = (e) => {
        e.preventDefault();
        if (email === 'smartsocks@milbotix.com' && password === '12345') {
            setAlertType('success');
            setTimeout(() => {
                setAlertType('');
                navigate('/admin/carers');
            }, 1500);
        } else {
            setAlertType('invalid');
        }
    };

    return (
        <div className='mainPage'>
            <div className='loginContiner'>
                <div className='loginBox'>
                    <div className='loginTBox'>
                        <div className='loginLeftImg'>

                        </div>
                    </div>
                    <div className='loginTBox'>
                        <div className='login_form_box'>
                            <div className='login_form_header'>
                                <img src='/milbotix.png' alt='logo' className='login_from_logo'></img>
                                <h2 className='login_h2'>{content.adminLogin.title}</h2>
                            </div>

                            <form className='login_form' onSubmit={handleSubmit}>
                                <div className='inputDiv'>
                                    <label className='from_lable'>{content.adminLogin.emailLabel}</label>
                                    <input type='email' required name='email' id='email' className='from_input' value={email} onChange={e => setEmail(e.target.value)}></input>
                                </div>
                                <div className='inputDiv'>
                                    <label className='from_lable'>{content.adminLogin.passwordLabel}</label>
                                    <input type='password' required name='password' id='password' className='from_input' value={password} onChange={e => setPassword(e.target.value)}></input>
                                </div>
                                <button type='submit' className='loginBtn'>{content.adminLogin.loginButton}</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className='Alert'>
                    {alertType === 'success' && (
                        <AlertDemo
                            type='success'
                            title={content.adminLogin.successTitle}
                            message={content.adminLogin.successMessage}
                            onClose={() => setAlertType('')}
                        />
                    )}
                    {alertType === 'invalid' && (
                        <AlertDemo
                            type='invalid'
                            title={content.adminLogin.invalidTitle}
                            message={content.adminLogin.invalidMessage}
                            onClose={() => setAlertType('')}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
