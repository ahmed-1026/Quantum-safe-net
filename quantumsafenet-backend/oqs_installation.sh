sudo apt update
sudo apt install cmake ninja-build python3-pip gcc g++ libssl-dev


git clone --recursive https://github.com/open-quantum-safe/liboqs
cd liboqs
mkdir build && cd build
cmake -GNinja -DCMAKE_INSTALL_PREFIX=/usr/local ..
ninja
sudo ninja install

export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

git clone --depth=1 https://github.com/open-quantum-safe/liboqs-python
cd liboqs-python
pip install .

