import React from 'react';

function ChangePassword() {
  return (
    <div className='w-full p-0.5'>
      <div className='w-full border border-[#00000020] bg-[#fff] shadow-[0_0_5px_#a4a4a4]'>
        <div className='bg-secondary text-secondary p-2'>
          <h4 className='text-[16px] font-[400]'>Change Password</h4>
        </div>
        <div className='mb-2 w-full px-2 lg:w-[50%]'>
          <form className='flex flex-col gap-2'>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='Current Password'
                className='text-[16px] font-[400] text-[#000000]'
              >
                Current Password:
              </label>
              <input
                type='password'
                id='Current Password'
                placeholder='Enter your current password'
                className='border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='New Password'
                className='text-[16px] font-[400] text-[#000000]'
              >
                New Password:
              </label>
              <input
                type='password'
                id='New Password'
                placeholder='Enter your new password'
                className='border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='Confirm Password'
                className='text-[16px] font-[400] text-[#000000]'
              >
                {' '}
                Confirm Password:
              </label>
              <input
                type='password'
                id='Confirm Password'
                placeholder='Enter your confirm password'
                className='border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <button className='bg-primary text-primary w-full rounded-xs p-1 text-[16px] font-[400]'>
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
