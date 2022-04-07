import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className='border-b p-6'>
        <p className="text-4xl font-bold">Project X marketplace</p>
        <div className='flex mt-3'>
          <Link href='/'>
            <a className='mr-6'>Home</a>
          </Link>
          <Link href='/gameplay'>
            <a className='mr-6'>Gameplay</a>
          </Link>
          <Link href='/market'>
            <a className='mr-6'>Market</a>
          </Link>
          <Link href='/inventory'>
            <a className='mr-6'>My Inventory</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
