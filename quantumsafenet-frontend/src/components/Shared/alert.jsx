import { EyeIcon, EyeOffIcon, AlertCircle, CheckCircle, X, WifiOff } from 'lucide-react';
const Alert = ({ type, title, message, setAlert }) => {
    const alertStyles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    const iconStyles = {
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400'
    };

    const AlertIcon = type === 'success' ? CheckCircle :
        type === 'warning' ? (navigator.onLine ? AlertCircle : WifiOff) :
            AlertCircle;

    return (
        <div className={`border rounded-lg p-4 mb-4 ${alertStyles[type]} animate-in slide-in-from-top-2 duration-300`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertIcon className={`h-5 w-5 ${iconStyles[type]}`} />
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium">{title}</h3>
                    <p className="text-sm mt-1">{message}</p>
                </div>
                <div className="ml-auto pl-3">
                    <button
                        onClick={() => setAlert(null)}
                        className={`inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-gray-600 ${iconStyles[type]}`}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;