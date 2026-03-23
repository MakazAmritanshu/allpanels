import { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Security = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Navbar />
      <div className='flex items-center justify-center bg-gray-100 p-2 text-[13px]'>
        <div className='w-full max-w-7xl rounded-lg border border-gray-300 bg-white'>
          {/* Header */}
          <div className='rounded-t-lg bg-[#243a48] px-4 py-2 font-bold text-white'>
            Secure Auth Verification
          </div>

          {/* Content */}
          <div className='p-4 text-center'>
            <p className='font-semibold'>
              Secure Auth Verification Status:{' '}
              <span className='rounded bg-red-500 px-2 py-1 text-sm text-white'>
                Disabled
              </span>
            </p>

            <p className='mt-2 font-semibold text-blue-600'>
              নিরাপদ প্রমাণীকরণের স্থিতি: নিষ্ক্রিয়
            </p>

            <p className='mt-2 text-gray-600'>
              Please select below option to enable secure auth verification
            </p>

            <p className='mt-1 cursor-pointer text-[#2789ce]'>
              নিরাপদ প্রমাণীকরণ যাচাই সক্ষম করতে দয়া করে নিচের বিকল্পটি
              নির্বাচন করুন।
            </p>

            <button className='mt-4 rounded-md bg-gray-300 px-4 py-2 text-gray-700 shadow'>
              Enable Using Telegram
            </button>

            {/* Password Input */}
            <div className='mt-6'>
              <p className='font-semibold'>
                Please enter your login password to continue
              </p>
              <div className='mx-auto mt-2 flex overflow-hidden rounded-lg border border-gray-300 md:w-[50%]'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className='flex-1 px-4 py-2 outline-none'
                  placeholder='Enter your login password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className='bg-gray-200 px-4'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FaEye />
                </button>
              </div>

              <button className='mt-4 rounded-md bg-[#243a48] px-4 py-2 text-white shadow'>
                Get Connection ID
              </button>
            </div>

            {/* Continue Button */}
            <div className='mt-6'>
              <p className='text-gray-500'>
                IF YOU HAVE ENABLED CONNECTION ID FROM TELEGRAM PLEASE CLICK
                HERE NOW
              </p>
              <button className='mt-2 rounded-md bg-green-600 px-6 py-2 text-white shadow'>
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Security;
