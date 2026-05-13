import os

with open('C:\\Users\\ADMIN\\Desktop\\Demo-Query\\QueryTalk-AI\\frontend\\src\\components\\LoginStitch.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("export default function LoginStitch() {", """import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setToken = useStore((state) => state.setToken);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setToken('dummy_token_for_testing');
    navigate('/connect');
  };
""")

content = content.replace("<form className=\"flex flex-col gap-5\">", "<form className=\"flex flex-col gap-5\" onSubmit={handleLogin}>")
content = content.replace("placeholder=\"admin@querytalk.ai\"", "placeholder=\"admin@querytalk.ai\" value={email} onChange={(e) => setEmail(e.target.value)}")
content = content.replace("placeholder=\"••••••••\"", "placeholder=\"••••••••\" value={password} onChange={(e) => setPassword(e.target.value)}")

with open('C:\\Users\\ADMIN\\Desktop\\Demo-Query\\QueryTalk-AI\\frontend\\src\\components\\Login.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
