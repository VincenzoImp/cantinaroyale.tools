import {contents} from "./layout";

export default function NotFound() {
    const page_not_found = contents.pages.page_not_found;
    return (
        <div className='flex items-center justify-center w-full min-h-[70vh] dark:text-gray-400 my-12 px-4'>
            <div className='flex flex-col items-center w-full gap-8'>
                <h1 className='text-9xl md:text-16xl w-full select-none text-center font-black dark:text-gray-400'>
                    404
                </h1>
                <p className='text-3xl font-semibold text-center'>{page_not_found.description}</p>
                <p className='text-2xl md:px-12 text-center'>{page_not_found.sub_description}</p>
                <div className='flex flex-row justify-between gap-8'>
                    <a href="/" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                        {page_not_found.home_page}
                    </a>
                </div>
            </div>
        </div>
    );
}