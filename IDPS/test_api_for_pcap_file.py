import asyncio
import pyshark
import nest_asyncio

# Apply the patch to allow nested event loops
nest_asyncio.apply()

async def process_pcap(file_path):
    capture = pyshark.FileCapture(file_path)

    input_data = []
    for packet in capture:
        try:
            data = {
                "duration": getattr(packet.frame_info, "time_delta", 0),
                "protocol_type": packet.highest_layer.lower(),
                "flag": getattr(packet.tcp, "flags", "SF") if hasattr(packet, "tcp") else "",
                "src_bytes": getattr(packet, "length", 0),  # Adjust based on available attributes
                "dst_bytes": 0,  # Requires additional logic for response analysis
                "land": 0,  # 1 if src IP == dest IP and src port == dest port, else 0
                "wrong_fragment": int(getattr(packet.ip, "frag_offset", 0)) if hasattr(packet, "ip") else 0,
                "urgent": int(getattr(packet.tcp, "urgent_pointer", 0)) if hasattr(packet, "tcp") else 0,
                "hot": 0,  # Requires application-layer logic
                "num_failed_logins": 0,  # Requires application-layer logic
                # "logged_in": 1 if hasattr(packet, "tcp") and int(packet.tcp.flags_ack) > 0 else 0,
                "num_compromised": 0,  # Requires IDS or application logic
                 "root_shell": 0,  # Requires application-layer logic
                "su_attempted": 0,  # Requires application-layer logic
                "num_file_creations": 0,  # Requires application-layer logic
                "num_shells": 0,  # Requires application-layer logic
                "num_access_files": 0,  # Requires application-layer logic
                "is_guest_login": 0,  # Requires application-layer logic
                "count": 3,  # Placeholder: Requires analysis over time
                "srv_count": 3,  # Placeholder: Requires analysis over time
                "serror_rate": 0.0,  # Placeholder: Analysis of connection errors
                "rerror_rate": 0.0,  # Placeholder: Analysis of connection errors
                "same_srv_rate": 0.8,  # Placeholder: Analysis of same-service rates
                "diff_srv_rate": 0.2,  # Placeholder: Analysis of different-service rates
                "srv_diff_host_rate": 0.0,  # Placeholder: Analysis of host connections
                "dst_host_count": 10,  # Placeholder: Count of packets to destination host
                "dst_host_srv_count": 8,  # Placeholder: Count of packets to services on destination
                "dst_host_diff_srv_rate": 0.1,  # Placeholder: Analysis of different services at destination
                "dst_host_same_src_port_rate": 0.9,  # Placeholder: Analysis of source port similarity
                "dst_host_srv_diff_host_rate": 0.0,  # Placeholder: Analysis of host connections
            }

            # Calculate `land`
            if hasattr(packet, "ip") and hasattr(packet, "tcp"):
                data["land"] = 1 if packet.ip.src == packet.ip.dst and packet.tcp.srcport == packet.tcp.dstport else 0

            # Add the parsed data to the list
            input_data.append(data)
        except AttributeError:
            # Skip packets missing required attributes
            continue

    return input_data

# Call the async function
file_path = "output.pcap"
input_data = asyncio.run(process_pcap(file_path))
print(input_data)
